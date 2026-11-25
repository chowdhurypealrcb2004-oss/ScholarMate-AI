/**
 * ScholarMate AI - Module 4: Client-Side Eligibility Evaluator (Audited)
 *
 * Implements deterministic requirement comparison, classification into
 * ELIGIBLE, POTENTIALLY_ELIGIBLE, and NOT_ELIGIBLE, and human-readable explanation generation.
 * Acts as an offline and client-side fallback matching backend evaluation service exactly.
 */

import rawScholarships from '../data/scholarships.json' with { type: 'json' };

export const SCHOLARSHIP_CATALOG = rawScholarships;

export const ELIGIBILITY_STATUS = {
  ELIGIBLE: 'ELIGIBLE',
  POTENTIALLY_ELIGIBLE: 'POTENTIALLY_ELIGIBLE',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
};

/**
 * Inspects a student profile for completeness and field validity
 * @param {Object} student
 * @returns {Object}
 */
export function inspectStudentProfile(student) {
  const errors = [];
  const missingFields = [];

  if (!student || typeof student !== 'object') {
    return {
      isValid: false,
      isComplete: false,
      errors: ['Student profile object is required.'],
      missingFields: ['name', 'department', 'cgpa', 'gender', 'needBased'],
      normalized: null,
    };
  }

  if (!student.name || typeof student.name !== 'string' || student.name.trim().length === 0) {
    errors.push('Student name is required.');
    missingFields.push('name');
  }

  const allowedDepartments = ['CSE', 'EEE', 'CE', 'BBA', 'English', 'Other'];
  if (!student.department || !allowedDepartments.includes(student.department)) {
    errors.push(`A valid academic department is required (${allowedDepartments.join(', ')}).`);
    missingFields.push('department');
  }

  const cgpaNum = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa);
  if (student.cgpa === undefined || student.cgpa === null || student.cgpa === '') {
    missingFields.push('cgpa');
  } else if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 4.0) {
    errors.push('Current CGPA must be a valid number between 0.00 and 4.00.');
    missingFields.push('cgpa');
  }

  const allowedGenders = ['Male', 'Female', 'Other'];
  if (!student.gender || !allowedGenders.includes(student.gender)) {
    errors.push('Gender selection is required (Male, Female, Other).');
    missingFields.push('gender');
  }

  let needBasedBool = null;
  if (typeof student.needBased === 'boolean') {
    needBasedBool = student.needBased;
  } else if (student.needBased === 'yes' || student.needBased === 'true') {
    needBasedBool = true;
  } else if (student.needBased === 'no' || student.needBased === 'false') {
    needBasedBool = false;
  } else if (student.needBased === undefined || student.needBased === null || student.needBased === '') {
    missingFields.push('needBased');
  } else {
    errors.push('Financial assistance status is required.');
    missingFields.push('needBased');
  }

  const degreeLevel = (student.degreeLevel || student.degree_level || '').trim() || null;
  const countryPreference = (student.countryPreference || student.country || student.nationality || '').trim() || null;

  const specialConditions = {
    hasPortfolio: student.hasPortfolio !== undefined ? Boolean(student.hasPortfolio) : (student.portfolio !== undefined ? Boolean(student.portfolio) : null),
    hasVolunteerHours: student.hasVolunteerHours !== undefined ? Boolean(student.hasVolunteerHours) : (student.volunteer !== undefined ? Boolean(student.volunteer) : null),
    hasSportsExcellence: student.hasSportsExcellence !== undefined ? Boolean(student.hasSportsExcellence) : null,
    isFirstGeneration: student.isFirstGeneration !== undefined ? Boolean(student.isFirstGeneration) : null,
    hasDisability: student.hasDisability !== undefined ? Boolean(student.hasDisability) : null,
    isRuralStudent: student.isRuralStudent !== undefined ? Boolean(student.isRuralStudent) : null,
  };

  const isValid = errors.length === 0;
  const isComplete = isValid && missingFields.length === 0;

  return {
    isValid,
    isComplete,
    errors,
    missingFields,
    normalized: {
      name: (student.name || '').trim(),
      department: student.department || '',
      cgpa: isNaN(cgpaNum) ? null : +(cgpaNum.toFixed(2)),
      gender: student.gender || '',
      needBased: needBasedBool,
      degreeLevel,
      countryPreference,
      specialConditions,
      raw: student,
    },
  };
}

/**
 * Extracts actual restrictions from a scholarship record without inventing artificial criteria
 * @param {Object} scholarship
 * @returns {Object}
 */
export function extractActualScholarshipCriteria(scholarship) {
  const minCgpa = typeof scholarship.min_cgpa === 'number'
    ? scholarship.min_cgpa
    : parseFloat(scholarship.min_cgpa) || 0;

  const departmentRaw = scholarship.department || 'All';
  const acceptedDepartments = departmentRaw === 'All'
    ? ['All']
    : (scholarship.departments || departmentRaw.split(';').map((d) => d.trim()));

  const gender = scholarship.gender || 'All';
  const needBased = (scholarship.need_based || 'no').trim().toLowerCase() === 'yes';

  const desc = (scholarship.description || '').toLowerCase();
  const name = (scholarship.name || '').toLowerCase();
  const text = `${name} ${desc}`;

  const prerequisites = [];

  if (desc.includes('project') || desc.includes('github') || desc.includes('software')) {
    prerequisites.push({
      id: 'hasPortfolio',
      label: 'Software / Project Portfolio',
      description: 'Requires practical project work or GitHub profile.',
    });
  }

  if (desc.includes('volunteer') || desc.includes('community')) {
    prerequisites.push({
      id: 'hasVolunteerHours',
      label: 'Volunteer / Community Service',
      description: 'Requires documented volunteer or community hours.',
    });
  }

  if (desc.includes('sports') || desc.includes('competitions')) {
    prerequisites.push({
      id: 'hasSportsExcellence',
      label: 'Sports / Extracurricular Representation',
      description: 'Requires tournament or competition participation.',
    });
  }

  if (desc.includes('first in their family')) {
    prerequisites.push({
      id: 'isFirstGeneration',
      label: 'First-Generation Attendee',
      description: 'Designated for first-generation university students.',
    });
  }

  if (desc.includes('disability')) {
    prerequisites.push({
      id: 'hasDisability',
      label: 'Disability Support Verification',
      description: 'Designated for students with documented disabilities.',
    });
  }

  if (desc.includes('rural')) {
    prerequisites.push({
      id: 'isRuralStudent',
      label: 'Rural Student Support',
      description: 'Designated for students from rural backgrounds with financial need.',
    });
  }

  let degreeRestriction = null;
  if (desc.includes('higher studies') || desc.includes('graduate') || desc.includes('master')) {
    degreeRestriction = 'Graduate';
  } else if (desc.includes('undergraduate') || desc.includes('bachelor')) {
    degreeRestriction = 'Undergraduate';
  }

  let regionalRestriction = null;
  if (text.includes('chattogram')) {
    regionalRestriction = 'Chattogram Region';
  }

  return {
    minCgpa,
    acceptedDepartments,
    gender,
    needBased,
    degreeRestriction,
    regionalRestriction,
    prerequisites,
  };
}

/**
 * Compares student qualifications against actual scholarship requirements
 * @param {Object} scholarship
 * @param {Object} studentProfile
 * @returns {Object}
 */
export function evaluateScholarshipCriteria(scholarship, studentProfile) {
  const inspected = studentProfile.normalized ? studentProfile : inspectStudentProfile(studentProfile);
  const student = inspected.normalized;
  const criteria = extractActualScholarshipCriteria(scholarship);

  const comparison = {
    cgpa: { status: 'PENDING', criteria: '', studentValue: '', deficit: 0, detail: '' },
    academicDepartment: { status: 'PENDING', criteria: '', studentValue: '', detail: '' },
    gender: { status: 'PENDING', criteria: '', studentValue: '', detail: '' },
    financialNeed: { status: 'PENDING', criteria: '', studentValue: '', detail: '' },
    degreeLevel: { status: 'NOT_APPLICABLE', criteria: 'Open to all degree levels', studentValue: student.degreeLevel || 'Unspecified', detail: 'No degree-level restriction specified for this scholarship.' },
    countryRestriction: { status: 'NOT_APPLICABLE', criteria: 'Open to all regions', studentValue: student.countryPreference || 'Unspecified', detail: 'No geographic restriction specified for this scholarship.' },
    specialPrerequisites: { status: 'SATISFIED', items: [], detail: '' },
  };

  // 1. CGPA Comparison
  comparison.cgpa.criteria = criteria.minCgpa > 0
    ? `Minimum CGPA of ${criteria.minCgpa.toFixed(2)}`
    : 'No minimum CGPA requirement';

  if (criteria.minCgpa > 0) {
    if (student.cgpa === null || student.cgpa === undefined) {
      comparison.cgpa.status = 'INCOMPLETE';
      comparison.cgpa.studentValue = 'Not Provided';
      comparison.cgpa.detail = 'CGPA is missing in student profile, preventing a definitive minimum CGPA check.';
    } else {
      comparison.cgpa.studentValue = student.cgpa.toFixed(2);
      if (student.cgpa >= criteria.minCgpa) {
        comparison.cgpa.status = 'SATISFIED';
        comparison.cgpa.deficit = 0;
        const surplus = +(student.cgpa - criteria.minCgpa).toFixed(2);
        comparison.cgpa.detail = `CGPA of ${student.cgpa.toFixed(2)} meets the required ${criteria.minCgpa.toFixed(2)} (+${surplus.toFixed(2)}).`;
      } else {
        const deficit = +(criteria.minCgpa - student.cgpa).toFixed(2);
        comparison.cgpa.status = 'FAILED';
        comparison.cgpa.deficit = deficit;
        comparison.cgpa.detail = `CGPA of ${student.cgpa.toFixed(2)} does not meet minimum requirement of ${criteria.minCgpa.toFixed(2)} (deficit: ${deficit.toFixed(2)}).`;
      }
    }
  } else {
    comparison.cgpa.status = 'SATISFIED';
    comparison.cgpa.studentValue = student.cgpa ? student.cgpa.toFixed(2) : 'N/A';
    comparison.cgpa.detail = 'No minimum CGPA cutoff required.';
  }

  // 2. Department Comparison
  const isDeptOpen = criteria.acceptedDepartments.includes('All');
  comparison.academicDepartment.criteria = isDeptOpen
    ? 'Open to all academic departments'
    : `Restricted to: ${criteria.acceptedDepartments.join(', ')}`;

  if (isDeptOpen) {
    comparison.academicDepartment.status = 'SATISFIED';
    comparison.academicDepartment.studentValue = student.department || 'Any';
    comparison.academicDepartment.detail = 'Open to all academic departments.';
  } else if (!student.department) {
    comparison.academicDepartment.status = 'INCOMPLETE';
    comparison.academicDepartment.studentValue = 'Not Provided';
    comparison.academicDepartment.detail = 'Student department not specified in profile.';
  } else if (criteria.acceptedDepartments.includes(student.department)) {
    comparison.academicDepartment.status = 'SATISFIED';
    comparison.academicDepartment.studentValue = student.department;
    comparison.academicDepartment.detail = `Department (${student.department}) is eligible.`;
  } else {
    comparison.academicDepartment.status = 'FAILED';
    comparison.academicDepartment.studentValue = student.department;
    comparison.academicDepartment.detail = `Department mismatch: requires ${criteria.acceptedDepartments.join(', ')}, but student is in ${student.department}.`;
  }

  // 3. Gender Comparison
  const isGenderOpen = criteria.gender === 'All';
  comparison.gender.criteria = isGenderOpen
    ? 'Open to all genders'
    : `Restricted to ${criteria.gender} applicants`;

  if (isGenderOpen) {
    comparison.gender.status = 'SATISFIED';
    comparison.gender.studentValue = student.gender || 'Any';
    comparison.gender.detail = 'Open to all genders.';
  } else if (!student.gender) {
    comparison.gender.status = 'INCOMPLETE';
    comparison.gender.studentValue = 'Not Provided';
    comparison.gender.detail = 'Gender not specified in profile.';
  } else if (student.gender === criteria.gender) {
    comparison.gender.status = 'SATISFIED';
    comparison.gender.studentValue = student.gender;
    comparison.gender.detail = `Gender condition met (${student.gender}).`;
  } else {
    comparison.gender.status = 'FAILED';
    comparison.gender.studentValue = student.gender;
    comparison.gender.detail = `Gender mismatch: designated for ${criteria.gender} applicants only (student profile: ${student.gender}).`;
  }

  // 4. Financial Need Comparison
  comparison.financialNeed.criteria = criteria.needBased
    ? 'Requires verified financial need (need-based aid)'
    : 'Merit-based selection (no financial need restriction)';

  if (criteria.needBased) {
    if (student.needBased === null || student.needBased === undefined) {
      comparison.financialNeed.status = 'INCOMPLETE';
      comparison.financialNeed.studentValue = 'Not Indicated';
      comparison.financialNeed.detail = 'Financial need preference not indicated in profile.';
    } else if (student.needBased === true) {
      comparison.financialNeed.status = 'SATISFIED';
      comparison.financialNeed.studentValue = 'Financial need indicated';
      comparison.financialNeed.detail = 'Applicant has indicated financial assistance requirement.';
    } else {
      comparison.financialNeed.status = 'FAILED';
      comparison.financialNeed.studentValue = 'Merit-only profile';
      comparison.financialNeed.detail = 'Scholarship is restricted to need-based applicants; student profile is set to merit-only.';
    }
  } else {
    comparison.financialNeed.status = 'SATISFIED';
    comparison.financialNeed.studentValue = student.needBased ? 'Financial need indicated' : 'Merit-only profile';
    comparison.financialNeed.detail = 'Merit-based award with no financial need constraint.';
  }

  // 5. Degree Level
  if (criteria.degreeRestriction) {
    comparison.degreeLevel.criteria = `Restricted to ${criteria.degreeRestriction} students`;
    if (!student.degreeLevel) {
      comparison.degreeLevel.status = 'INCOMPLETE';
      comparison.degreeLevel.studentValue = 'Not Specified';
      comparison.degreeLevel.detail = `Scholarship mentions ${criteria.degreeRestriction} standing; student degree level is not specified in profile.`;
    } else {
      comparison.degreeLevel.studentValue = student.degreeLevel;
      const match = student.degreeLevel.toLowerCase().includes(criteria.degreeRestriction.toLowerCase());
      if (match) {
        comparison.degreeLevel.status = 'SATISFIED';
        comparison.degreeLevel.detail = `Degree level (${student.degreeLevel}) meets ${criteria.degreeRestriction} requirement.`;
      } else {
        comparison.degreeLevel.status = 'FAILED';
        comparison.degreeLevel.detail = `Degree mismatch: requires ${criteria.degreeRestriction}, student is ${student.degreeLevel}.`;
      }
    }
  }

  // 6. Regional / Geographic Restriction
  if (criteria.regionalRestriction) {
    comparison.countryRestriction.criteria = `Restricted to ${criteria.regionalRestriction}`;
    if (!student.countryPreference) {
      comparison.countryRestriction.status = 'INCOMPLETE';
      comparison.countryRestriction.studentValue = 'Not Specified';
      comparison.countryRestriction.detail = `Scholarship specifies ${criteria.regionalRestriction}; regional preference not indicated in profile.`;
    } else {
      comparison.countryRestriction.studentValue = student.countryPreference;
      const match = student.countryPreference.toLowerCase().includes('chattogram') || student.countryPreference.toLowerCase() === 'bangladesh';
      if (match) {
        comparison.countryRestriction.status = 'SATISFIED';
        comparison.countryRestriction.detail = `Regional requirement (${criteria.regionalRestriction}) satisfied.`;
      } else {
        comparison.countryRestriction.status = 'FAILED';
        comparison.countryRestriction.detail = `Regional mismatch: restricted to ${criteria.regionalRestriction}.`;
      }
    }
  }

  // 7. Special Prerequisites
  const prereqItems = [];
  criteria.prerequisites.forEach((p) => {
    const studentVal = student.specialConditions[p.id];
    if (studentVal === true) {
      prereqItems.push({
        id: p.id,
        label: p.label,
        status: 'SATISFIED',
        studentValue: 'Confirmed',
        detail: `Prerequisite met: ${p.label}.`,
      });
    } else if (studentVal === false) {
      prereqItems.push({
        id: p.id,
        label: p.label,
        status: 'FAILED',
        studentValue: 'Not Met',
        detail: `Student indicated they do not meet prerequisite: ${p.label}.`,
      });
    } else {
      prereqItems.push({
        id: p.id,
        label: p.label,
        status: 'INCOMPLETE',
        studentValue: 'Unconfirmed in Profile',
        detail: `Scholarship requirement (${p.label}) is unconfirmed in student profile (${p.description}).`,
      });
    }
  });

  comparison.specialPrerequisites.items = prereqItems;

  // 8. Classification
  const standardKeys = ['cgpa', 'academicDepartment', 'gender', 'financialNeed', 'degreeLevel', 'countryRestriction'];
  const hasHardFail = standardKeys.some((k) => comparison[k].status === 'FAILED') ||
    prereqItems.some((item) => item.status === 'FAILED');

  let status = ELIGIBILITY_STATUS.ELIGIBLE;
  let classificationReason = 'ALL_REQUIREMENTS_SATISFIED';
  let readinessScore = 95;

  if (hasHardFail) {
    status = ELIGIBILITY_STATUS.NOT_ELIGIBLE;
    classificationReason = 'FAILED_MANDATORY_CRITERIA';
    readinessScore = 25;
  } else {
    const incompleteStandardKeys = standardKeys.filter((k) => comparison[k].status === 'INCOMPLETE');
    const incompletePrereqs = prereqItems.filter((item) => item.status === 'INCOMPLETE');

    if (incompleteStandardKeys.length > 0 || incompletePrereqs.length > 0) {
      status = ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE;
      if (incompleteStandardKeys.includes('cgpa')) {
        classificationReason = 'MISSING_CGPA_PREVENTS_DECISION';
      } else if (incompletePrereqs.length > 0) {
        classificationReason = 'SPECIAL_PREREQUISITE_UNCONFIRMED';
      } else {
        classificationReason = 'INCOMPLETE_STUDENT_INFORMATION';
      }
      readinessScore = 70;
    }
  }

  // 9. Explanations
  const satisfiedConditions = [];
  const missingRequirements = [];
  const incompleteRequirements = [];
  const comparisonTable = [];

  const addRow = (label, compField) => {
    if (compField.status === 'NOT_APPLICABLE') return;

    comparisonTable.push({
      criteria: label,
      requirement: compField.criteria,
      studentValue: compField.studentValue,
      status: compField.status,
      detail: compField.detail,
    });

    if (compField.status === 'SATISFIED') {
      satisfiedConditions.push(`${label}: ${compField.detail}`);
    } else if (compField.status === 'FAILED') {
      missingRequirements.push(`${label}: ${compField.detail}`);
    } else if (compField.status === 'INCOMPLETE') {
      incompleteRequirements.push(`${label}: ${compField.detail}`);
    }
  };

  addRow('Minimum CGPA', comparison.cgpa);
  addRow('Academic Department', comparison.academicDepartment);
  addRow('Gender Requirement', comparison.gender);
  addRow('Financial Need Condition', comparison.financialNeed);
  addRow('Degree Level', comparison.degreeLevel);
  addRow('Geographic / Regional Restriction', comparison.countryRestriction);

  prereqItems.forEach((p) => {
    comparisonTable.push({
      criteria: p.label,
      requirement: 'Special scholarship prerequisite',
      studentValue: p.studentValue,
      status: p.status,
      detail: p.detail,
    });

    if (p.status === 'SATISFIED') satisfiedConditions.push(`${p.label}: ${p.detail}`);
    else if (p.status === 'FAILED') missingRequirements.push(`${p.label}: ${p.detail}`);
    else if (p.status === 'INCOMPLETE') incompleteRequirements.push(`${p.label}: ${p.detail}`);
  });

  let narrativeExplanation = '';
  let actionableGuidance = '';

  if (status === ELIGIBILITY_STATUS.ELIGIBLE) {
    narrativeExplanation = `Fully Qualified: You satisfy all ${satisfiedConditions.length} applicable eligibility criteria: ${satisfiedConditions.map((s) => s.split(':')[0]).join(', ')}. No criteria failed or unconfirmed.`;
    actionableGuidance = `Submit your application to ${scholarship.provider} before the deadline on ${scholarship.deadline}.`;
  } else if (status === ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE) {
    narrativeExplanation = `Potentially Eligible (Incomplete Information): You satisfy all evaluated academic thresholds, but ${incompleteRequirements.length} prerequisite(s) could not be verified from your profile: ${incompleteRequirements.map((r) => r.split(':')[0]).join(', ')}.`;
    actionableGuidance = `Confirm whether you satisfy the unverified prerequisite(s) in your student profile to confirm eligibility.`;
  } else {
    narrativeExplanation = `Not Eligible: You do not satisfy ${missingRequirements.length} mandatory requirement(s): ${missingRequirements.map((m) => m.split(':')[1]?.trim() || m).join('; ')}.`;
    actionableGuidance = `Explore scholarships with eligibility criteria matching your current profile.`;
  }

  return {
    scholarship,
    status,
    classificationReason,
    readinessScore,
    matchScore: readinessScore,
    comparison,
    breakdown: {
      cgpaMet: comparison.cgpa.status === 'SATISFIED',
      departmentMet: comparison.academicDepartment.status === 'SATISFIED',
      genderMet: comparison.gender.status === 'SATISFIED',
      needMet: comparison.financialNeed.status === 'SATISFIED',
      cgpaDiff: comparison.cgpa.deficit || 0,
      missingReasons: missingRequirements,
      additionalCriteria: prereqItems.map((i) => i.label),
    },
    explanation: {
      narrativeExplanation,
      actionableGuidance,
      satisfiedConditions,
      missingRequirements,
      incompleteRequirements,
      comparisonTable,
    },
  };
}

/**
 * Runs full evaluation of a student profile against scholarship catalog
 * @param {Object} studentProfile
 * @param {Array<Object>} [catalog]
 * @returns {Object}
 */
export function evaluateStudentScholarshipsClient(studentProfile, catalog = SCHOLARSHIP_CATALOG) {
  const inspected = inspectStudentProfile(studentProfile);

  if (!inspected.isValid) {
    throw new Error('Student profile validation failed: ' + inspected.errors.join(' '));
  }

  const eligible = [];
  const potentiallyEligible = [];
  const notEligible = [];

  for (const scholarship of catalog) {
    const evaluated = evaluateScholarshipCriteria(scholarship, inspected);
    if (evaluated.status === ELIGIBILITY_STATUS.ELIGIBLE) {
      eligible.push(evaluated);
    } else if (evaluated.status === ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE) {
      potentiallyEligible.push(evaluated);
    } else {
      notEligible.push(evaluated);
    }
  }

  eligible.sort((a, b) => (b.scholarship.amount_bdt || 0) - (a.scholarship.amount_bdt || 0));
  potentiallyEligible.sort((a, b) => b.readinessScore - a.readinessScore);
  notEligible.sort((a, b) => (a.breakdown.cgpaDiff || 0) - (b.breakdown.cgpaDiff || 0));

  const totalEligibleAid = eligible.reduce((acc, item) => acc + (item.scholarship.amount_bdt || 0), 0);
  const totalPotentialAid = potentiallyEligible.reduce((acc, item) => acc + (item.scholarship.amount_bdt || 0), 0);

  const aiAdvisorContext = {
    profileSummary: {
      studentName: inspected.normalized.name,
      department: inspected.normalized.department,
      cgpa: inspected.normalized.cgpa,
      gender: inspected.normalized.gender,
      needBased: inspected.normalized.needBased,
      degreeLevel: inspected.normalized.degreeLevel || 'Not Specified',
      countryPreference: inspected.normalized.countryPreference || 'Not Specified',
      isIncomplete: !inspected.isComplete,
      missingFields: inspected.missingFields,
    },
    topStrengths: [
      inspected.normalized.cgpa >= 3.5 ? `Strong CGPA standing (${inspected.normalized.cgpa})` : null,
      `${inspected.normalized.department} department eligibility`,
      inspected.normalized.needBased ? 'Qualifies for need-based tuition funds' : 'Qualifies for merit awards',
    ].filter(Boolean),
    topEligibleAwards: eligible.slice(0, 3).map((e) => ({
      id: e.scholarship.id,
      name: e.scholarship.name,
      provider: e.scholarship.provider,
      amount: e.scholarship.amount_bdt,
      deadline: e.scholarship.deadline,
    })),
    keyMissingCriteriaToUnlockPotential: potentiallyEligible.slice(0, 3).map((p) => ({
      scholarshipName: p.scholarship.name,
      incomplete: p.explanation.incompleteRequirements,
    })),
    recommendedNextSteps: [
      eligible.length > 0 ? `Apply to ${eligible.length} fully qualified scholarships.` : null,
      potentiallyEligible.length > 0 ? `Review prerequisites for ${potentiallyEligible.length} potentially eligible opportunities.` : null,
    ].filter(Boolean),
  };

  return {
    student: inspected.normalized,
    isComplete: inspected.isComplete,
    missingFields: inspected.missingFields,
    classification: {
      eligible,
      potentiallyEligible,
      notEligible,
    },
    fullyEligible: eligible,
    almostEligible: potentiallyEligible,
    summary: {
      totalScholarships: catalog.length,
      eligibleCount: eligible.length,
      potentiallyEligibleCount: potentiallyEligible.length,
      notEligibleCount: notEligible.length,
      totalMatches: eligible.length + potentiallyEligible.length,
      totalEligibleAid,
      totalPotentialAid,
      totalPotentialAidBdt: totalEligibleAid + totalPotentialAid,
      totalCatalogSize: catalog.length,
      highestEligibleAward: eligible.length > 0 ? eligible[0].scholarship.amount_bdt : 0,
      profileCompletenessPercent: Math.round(((5 - inspected.missingFields.length) / 5) * 100),
    },
    aiAdvisorContext,
  };
}

export default {
  ELIGIBILITY_STATUS,
  SCHOLARSHIP_CATALOG,
  inspectStudentProfile,
  extractActualScholarshipCriteria,
  evaluateScholarshipCriteria,
  evaluateStudentScholarshipsClient,
};
