/**
 * ScholarMate AI - Deterministic Eligibility Matching Engine
 * Shared client/server utility that strictly implements requirements without hallucination
 */

import rawScholarships from '../data/scholarships.json';

export const SCHOLARSHIP_DATASET = rawScholarships;

/**
 * Validates a student profile strictly
 * @param {Object} student
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateStudentProfile(student) {
  const errors = [];
  if (!student || typeof student !== 'object') {
    return { isValid: false, errors: ['Student profile is required.'] };
  }

  if (!student.name || typeof student.name !== 'string' || student.name.trim().length === 0) {
    errors.push('Student full name is required.');
  }

  const allowedDepts = ['CSE', 'EEE', 'CE', 'BBA', 'English', 'Other'];
  if (!student.department || !allowedDepts.includes(student.department)) {
    errors.push('Valid academic department is required.');
  }

  const cgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa);
  if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) {
    errors.push('CGPA must be between 0.00 and 4.00.');
  }

  const allowedGenders = ['Male', 'Female', 'Other'];
  if (!student.gender || !allowedGenders.includes(student.gender)) {
    errors.push('Gender is required.');
  }

  if (typeof student.needBased !== 'boolean') {
    errors.push('Financial need indicator is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates a single scholarship against student profile
 * Enforces Department and Gender as mandatory gates
 * Identifies Almost Eligible when department/gender match and CGPA is within reachable deficit (<= 0.35)
 * @param {Object} scholarship
 * @param {Object} student
 * @returns {Object}
 */
export function evaluateScholarship(scholarship, student) {
  const missingReasons = [];
  const additionalCriteria = [];

  // 1. CGPA evaluation
  const minCgpa = typeof scholarship.min_cgpa === 'number' ? scholarship.min_cgpa : parseFloat(scholarship.min_cgpa) || 0;
  const studentCgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa) || 0;
  const cgpaMet = studentCgpa >= minCgpa;
  const cgpaDiff = cgpaMet ? 0 : +(minCgpa - studentCgpa).toFixed(2);

  if (!cgpaMet) {
    missingReasons.push(`Requires min CGPA ${minCgpa.toFixed(2)} (you have ${studentCgpa.toFixed(2)}, deficit: ${cgpaDiff.toFixed(2)})`);
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
    missingReasons.push(`Restricted to departments: ${scholarship.department}`);
  }

  // 3. Gender requirement (Hard gate)
  let genderMet = false;
  if (scholarship.gender === 'All') {
    genderMet = true;
  } else if (scholarship.gender === student.gender) {
    genderMet = true;
  }

  if (!genderMet) {
    missingReasons.push(`Designated exclusively for ${scholarship.gender} applicants`);
  }

  // 4. Financial need requirement
  let needMet = true;
  if (scholarship.need_based === 'yes' && !student.needBased) {
    needMet = false;
    missingReasons.push('Requires verified financial need (your profile is set to merit-only)');
  }

  // Parse additional criteria from description
  if (scholarship.description) {
    const desc = scholarship.description.toLowerCase();
    if (desc.includes('project') || desc.includes('github') || desc.includes('software')) {
      additionalCriteria.push('Practical project or software portfolio');
    }
    if (desc.includes('volunteer') || desc.includes('community')) {
      additionalCriteria.push('Documented volunteer / community hours');
    }
    if (desc.includes('sports') || desc.includes('competitions')) {
      additionalCriteria.push('Athletic / tournament participation');
    }
    if (desc.includes('first in their family')) {
      additionalCriteria.push('First generation university attendee verification');
    }
  }

  // Status Determination
  let status = 'NOT_ELIGIBLE';

  if (departmentMet && genderMet) {
    if (cgpaMet && needMet) {
      status = 'ELIGIBLE';
    } else if (!cgpaMet && cgpaDiff <= 0.35 && needMet) {
      status = 'ALMOST_ELIGIBLE';
    } else if (cgpaMet && !needMet) {
      status = 'ALMOST_ELIGIBLE';
    }
  }

  // Match score (0 - 100)
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
 * Matches student profile against given scholarship list (or default catalog)
 * @param {Object} studentProfile
 * @param {Array<Object>} [scholarshipList]
 * @returns {Object}
 */
export function matchStudentScholarshipsClient(studentProfile, scholarshipList = SCHOLARSHIP_DATASET) {
  const validation = validateStudentProfile(studentProfile);
  if (!validation.isValid) {
    const err = new Error('Incomplete or invalid student profile');
    err.errors = validation.errors;
    throw err;
  }

  const fullyEligible = [];
  const almostEligible = [];
  const otherMatches = [];

  for (const item of scholarshipList) {
    const evaluated = evaluateScholarship(item, studentProfile);
    if (evaluated.status === 'ELIGIBLE') {
      fullyEligible.push(evaluated);
    } else if (evaluated.status === 'ALMOST_ELIGIBLE') {
      almostEligible.push(evaluated);
    } else {
      otherMatches.push(evaluated);
    }
  }

  // Sort eligible by amount descending
  fullyEligible.sort((a, b) => b.scholarship.amount_bdt - a.scholarship.amount_bdt);
  almostEligible.sort((a, b) => a.breakdown.cgpaDiff - b.breakdown.cgpaDiff);

  const totalAid = fullyEligible.reduce((sum, item) => sum + (item.scholarship.amount_bdt || 0), 0);

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
      totalScholarships: scholarshipList.length,
      eligibleCount: fullyEligible.length,
      almostEligibleCount: almostEligible.length,
      notEligibleCount: otherMatches.length,
      totalMatches: fullyEligible.length + almostEligible.length,
      totalPotentialAidBdt: totalAid,
      totalEligibleAid: totalAid,
      totalFound: fullyEligible.length,
      totalCatalogSize: scholarshipList.length,
      highestEligibleAward: fullyEligible.length > 0 ? fullyEligible[0].scholarship.amount_bdt : 0,
    },
  };
}

export default {
  validateStudentProfile,
  evaluateScholarship,
  matchStudentScholarshipsClient,
  SCHOLARSHIP_DATASET,
};
