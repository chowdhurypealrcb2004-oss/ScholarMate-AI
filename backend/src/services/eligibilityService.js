import scholarshipService from './csvService.js';

/**
 * Validates a student profile payload strictly
 * Never assumes eligibility if data is missing or incomplete
 * @param {Object} student
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateStudentProfile(student) {
  const errors = [];

  if (!student || typeof student !== 'object') {
    return { isValid: false, errors: ['Student profile object is required.'] };
  }

  if (!student.name || typeof student.name !== 'string' || student.name.trim().length === 0) {
    errors.push('Student name is required.');
  }

  const allowedDepartments = ['CSE', 'EEE', 'CE', 'BBA', 'English', 'Other'];
  if (!student.department || !allowedDepartments.includes(student.department)) {
    errors.push(`A valid academic department is required (${allowedDepartments.join(', ')}).`);
  }

  const cgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa);
  if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) {
    errors.push('Current CGPA must be a valid number between 0.00 and 4.00.');
  }

  const allowedGenders = ['Male', 'Female', 'Other'];
  if (!student.gender || !allowedGenders.includes(student.gender)) {
    errors.push('Gender selection is required (Male, Female, Other).');
  }

  if (typeof student.needBased !== 'boolean') {
    errors.push('Financial assistance status (needBased: true/false) is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates a single scholarship against a student profile
 * Enforces Department and Gender as mandatory gates
 * Identifies Almost Eligible when department/gender match and CGPA is within reachable deficit (<= 0.35)
 * @param {Object} scholarship
 * @param {Object} student
 * @returns {Object}
 */
export function evaluateScholarshipMatch(scholarship, student) {
  const missingReasons = [];
  const additionalCriteria = [];

  // 1. CGPA evaluation
  const minCgpa = typeof scholarship.min_cgpa === 'number' ? scholarship.min_cgpa : parseFloat(scholarship.min_cgpa) || 0;
  const studentCgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa) || 0;
  const cgpaMet = studentCgpa >= minCgpa;
  const cgpaDiff = cgpaMet ? 0 : +(minCgpa - studentCgpa).toFixed(2);

  if (!cgpaMet) {
    missingReasons.push(`Requires minimum CGPA of ${minCgpa.toFixed(2)} (current: ${studentCgpa.toFixed(2)}, deficit: ${cgpaDiff.toFixed(2)})`);
  }

  // 2. Department evaluation (Hard gate)
  let departmentMet = false;
  if (scholarship.department === 'All') {
    departmentMet = true;
  } else if (Array.isArray(scholarship.departments) && scholarship.departments.includes(student.department)) {
    departmentMet = true;
  } else if (typeof scholarship.department === 'string' && scholarship.department.split(';').map((d) => d.trim()).includes(student.department)) {
    departmentMet = true;
  }

  if (!departmentMet) {
    missingReasons.push(`Eligible departments: ${scholarship.department} (student: ${student.department})`);
  }

  // 3. Gender requirement (Hard gate)
  let genderMet = false;
  if (scholarship.gender === 'All') {
    genderMet = true;
  } else if (scholarship.gender === student.gender) {
    genderMet = true;
  }

  if (!genderMet) {
    missingReasons.push(`Restricted to ${scholarship.gender} students only (student: ${student.gender})`);
  }

  // 4. Financial need requirement
  let needMet = true;
  if (scholarship.need_based === 'yes' && !student.needBased) {
    needMet = false;
    missingReasons.push('Requires verified financial need (profile set to merit-only)');
  }

  // Additional criteria parsed from description
  if (scholarship.description) {
    const desc = scholarship.description.toLowerCase();
    if (desc.includes('project') || desc.includes('github') || desc.includes('software')) {
      additionalCriteria.push('Practical project or portfolio submission');
    }
    if (desc.includes('volunteer') || desc.includes('community')) {
      additionalCriteria.push('Community service or volunteer documentation');
    }
    if (desc.includes('sports') || desc.includes('competitions')) {
      additionalCriteria.push('Extracurricular or sports representation');
    }
    if (desc.includes('renewable') || desc.includes('renewable every semester')) {
      additionalCriteria.push('Subject to semester-by-semester renewal conditions');
    }
  }

  // Status Determination
  let status = 'NOT_ELIGIBLE';

  // Department and Gender are strict prerequisites
  if (departmentMet && genderMet) {
    if (cgpaMet && needMet) {
      status = 'ELIGIBLE';
    } else if (!cgpaMet && cgpaDiff <= 0.35 && needMet) {
      // Within reach: student satisfies departmental/gender/need criteria, CGPA deficit is <= 0.35
      status = 'ALMOST_ELIGIBLE';
    } else if (cgpaMet && !needMet) {
      // Meets academic cutoff & dept, but scholarship is need-based while student is merit-only
      status = 'ALMOST_ELIGIBLE';
    }
  }

  // Calculate Match Score (0 - 100)
  let matchScore = 0;
  if (status === 'ELIGIBLE') {
    matchScore = 70;
    const excess = studentCgpa - minCgpa;
    matchScore += Math.min(20, Math.round(excess * 20));
    if (scholarship.department !== 'All') matchScore += 10;
  } else if (status === 'ALMOST_ELIGIBLE') {
    matchScore = 45;
    if (cgpaDiff > 0 && cgpaDiff <= 0.35) {
      matchScore += Math.round((0.35 - cgpaDiff) * 50);
    } else if (cgpaMet) {
      matchScore += 20;
    }
    if (scholarship.department !== 'All') matchScore += 5;
  } else {
    // Ineligible
    matchScore = Math.max(0, Math.min(30, Math.round((studentCgpa / 4.0) * 25)));
  }

  return {
    scholarship,
    status,
    matchScore: Math.min(100, Math.max(0, matchScore)),
    breakdown: {
      cgpaMet,
      departmentMet,
      genderMet,
      needMet,
      cgpaDiff,
      missingReasons,
      additionalCriteria,
    },
  };
}

/**
 * Matches student profile against all scholarships
 * @param {Object} studentProfile
 * @returns {Object}
 */
export function matchStudentScholarships(studentProfile) {
  const validation = validateStudentProfile(studentProfile);
  if (!validation.isValid) {
    const error = new Error('Invalid or incomplete student profile');
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const allScholarships = scholarshipService.getAll();
  const fullyEligible = [];
  const almostEligible = [];
  const otherMatches = [];

  for (const scholarship of allScholarships) {
    const match = evaluateScholarshipMatch(scholarship, studentProfile);
    if (match.status === 'ELIGIBLE') {
      fullyEligible.push(match);
    } else if (match.status === 'ALMOST_ELIGIBLE') {
      almostEligible.push(match);
    } else {
      otherMatches.push(match);
    }
  }

  // Sort eligible by highest amount or matchScore
  fullyEligible.sort((a, b) => b.scholarship.amount_bdt - a.scholarship.amount_bdt);
  almostEligible.sort((a, b) => a.breakdown.cgpaDiff - b.breakdown.cgpaDiff);

  const totalEligibleAmount = fullyEligible.reduce(
    (acc, item) => acc + (item.scholarship.amount_bdt || 0),
    0
  );

  return {
    student: {
      name: studentProfile.name.trim(),
      department: studentProfile.department,
      cgpa: +(parseFloat(studentProfile.cgpa).toFixed(2)),
      gender: studentProfile.gender,
      needBased: studentProfile.needBased,
    },
    fullyEligible,
    almostEligible,
    summary: {
      totalScholarships: allScholarships.length,
      eligibleCount: fullyEligible.length,
      almostEligibleCount: almostEligible.length,
      notEligibleCount: otherMatches.length,
      totalMatches: fullyEligible.length + almostEligible.length,
      totalPotentialAidBdt: totalEligibleAmount,
      totalEligibleAid: totalEligibleAmount,
      totalFound: fullyEligible.length,
      totalCatalogSize: allScholarships.length,
      highestEligibleAward: fullyEligible.length > 0 ? fullyEligible[0].scholarship.amount_bdt : 0,
    },
  };
}

export default {
  validateStudentProfile,
  evaluateScholarshipMatch,
  matchStudentScholarships,
};
