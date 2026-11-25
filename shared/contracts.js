/**
 * ScholarMate AI - Shared Contracts & Interface Constants
 * Single source of truth for both Frontend and Backend
 */

export const DEPARTMENTS = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'EEE', label: 'Electrical & Electronic Engineering (EEE)' },
  { value: 'CE', label: 'Civil Engineering (CE)' },
  { value: 'BBA', label: 'Bachelor of Business Administration (BBA)' },
  { value: 'English', label: 'Department of English' },
  { value: 'Other', label: 'Other Disciplines' },
];

export const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other / Prefer not to say' },
];

export const FINANCIAL_NEED_OPTIONS = [
  { value: true, label: 'Yes, I require financial assistance' },
  { value: false, label: 'No, looking for merit-based only' },
];

export const DEGREE_LEVELS = [
  { value: 'Undergraduate', label: 'Undergraduate (Bachelor\'s Degree)' },
  { value: 'Graduate', label: 'Graduate (Master\'s Degree)' },
  { value: 'PhD', label: 'Doctorate (Ph.D.)' },
  { value: 'Diploma', label: 'High School / Diploma' },
  { value: 'Other', label: 'Other Qualifications' },
];

export const COUNTRY_OPTIONS = [
  { value: 'Bangladesh', label: 'Bangladesh (Domestic)' },
  { value: 'International', label: 'International / Study Abroad' },
  { value: 'Any', label: 'Open to Any Region' },
];

export const ELIGIBILITY_STATUS = {
  ELIGIBLE: 'ELIGIBLE',
  POTENTIALLY_ELIGIBLE: 'POTENTIALLY_ELIGIBLE',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
};

/**
 * Validates a student profile
 * @param {Object} profile
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export function validateStudentProfile(profile) {
  const errors = {};

  if (!profile.name || typeof profile.name !== 'string' || profile.name.trim().length === 0) {
    errors.name = 'Please provide your full name.';
  } else if (profile.name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters.';
  }

  const allowedDepartments = ['CSE', 'EEE', 'CE', 'BBA', 'English', 'Other'];
  if (!profile.department || !allowedDepartments.includes(profile.department)) {
    errors.department = 'Please select a valid academic department.';
  }

  const cgpaNum = parseFloat(profile.cgpa);
  if (isNaN(cgpaNum)) {
    errors.cgpa = 'CGPA is required.';
  } else if (cgpaNum < 0.0 || cgpaNum > 4.0) {
    errors.cgpa = 'CGPA must be between 0.00 and 4.00.';
  }

  const allowedGenders = ['Male', 'Female', 'Other'];
  if (!profile.gender || !allowedGenders.includes(profile.gender)) {
    errors.gender = 'Please select your gender.';
  }

  if (typeof profile.needBased !== 'boolean') {
    errors.needBased = 'Please indicate whether you need financial assistance.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
