/**
 * ScholarMate AI - Student Profile Form Constants & Validation
 * Module 2: Student Profile & Validation
 */

export const STUDENT_DEPARTMENTS = [
  { value: 'CSE', label: 'CSE — Computer Science & Engineering' },
  { value: 'EEE', label: 'EEE — Electrical & Electronic Engineering' },
  { value: 'CE', label: 'CE — Civil Engineering' },
  { value: 'BBA', label: 'BBA — Business Administration' },
  { value: 'English', label: 'English — Department of English' },
];

export const STUDENT_GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const FINANCIAL_ASSISTANCE_OPTIONS = [
  { value: 'yes', label: 'Yes — I require financial assistance' },
  { value: 'no', label: 'No — Merit-based scholarships only' },
];

export const INITIAL_PROFILE_FORM_STATE = {
  name: '',
  department: '',
  cgpa: '',
  gender: '',
  needBased: '',
};

const CGPA_PATTERN = /^-?\d+(?:\.\d+)?$/;

/**
 * Normalizes external initial values or presets into controlled form string values.
 * @param {Partial<{ name: string, department: string, cgpa: number|string, gender: string, needBased: boolean|string }>} values
 */
export function toFormState(values = {}) {
  let needBasedValue = '';
  if (values.needBased === true || values.needBased === 'yes' || values.needBased === 'true') {
    needBasedValue = 'yes';
  } else if (values.needBased === false || values.needBased === 'no' || values.needBased === 'false') {
    needBasedValue = 'no';
  }

  let cgpaValue = '';
  if (values.cgpa !== undefined && values.cgpa !== null && values.cgpa !== '') {
    cgpaValue = String(values.cgpa);
  }

  return {
    name: typeof values.name === 'string' ? values.name : '',
    department: typeof values.department === 'string' ? values.department : '',
    cgpa: cgpaValue,
    gender: typeof values.gender === 'string' ? values.gender : '',
    needBased: needBasedValue,
  };
}

/**
 * Validates a single form field and returns an error message or empty string.
 * @param {string} fieldName
 * @param {string} value
 * @param {Array<{ value: string, label: string }>} [departments]
 * @returns {string}
 */
export function validateField(fieldName, value, departments = STUDENT_DEPARTMENTS) {
  const allowedDepartments = departments.map((dept) => dept.value);
  const allowedGenders = STUDENT_GENDERS.map((g) => g.value);

  switch (fieldName) {
    case 'name': {
      if (typeof value !== 'string' || value.trim().length === 0) {
        return 'Student name is required.';
      }
      if (value.trim().length > 100) {
        return 'Student name must not exceed 100 characters.';
      }
      return '';
    }

    case 'department': {
      if (!value || !allowedDepartments.includes(value)) {
        return 'Please select your academic department.';
      }
      return '';
    }

    case 'cgpa': {
      const trimmed = typeof value === 'number' ? String(value) : String(value ?? '').trim();
      if (trimmed.length === 0) {
        return 'Current CGPA is required.';
      }
      if (!CGPA_PATTERN.test(trimmed)) {
        return 'Please enter a valid numeric CGPA (e.g., 3.50).';
      }
      const parsed = Number.parseFloat(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 4) {
        return 'CGPA must be between 0.00 and 4.00.';
      }
      return '';
    }

    case 'gender': {
      if (!value || !allowedGenders.includes(value)) {
        return 'Please select your gender.';
      }
      return '';
    }

    case 'needBased': {
      if (value !== 'yes' && value !== 'no' && typeof value !== 'boolean') {
        return 'Please indicate whether you require financial assistance.';
      }
      return '';
    }

    default:
      return '';
  }
}

/**
 * Validates all student profile form fields and builds the standardized StudentProfile payload.
 * @param {Object} formValues
 * @param {Array<{ value: string, label: string }>} [departments]
 * @returns {{ isValid: boolean, errors: Object.<string, string>, profile: { name: string, department: string, cgpa: number, gender: string, needBased: boolean } | null }}
 */
export function validateStudentForm(formValues, departments = STUDENT_DEPARTMENTS) {
  const fields = ['name', 'department', 'cgpa', 'gender', 'needBased'];
  const errors = {};

  for (const field of fields) {
    const error = validateField(field, formValues[field], departments);
    if (error) {
      errors[field] = error;
    }
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return { isValid: false, errors, profile: null };
  }

  const parsedCgpa = Number.parseFloat(String(formValues.cgpa).trim());
  const normalizedNeedBased =
    formValues.needBased === true || formValues.needBased === 'yes';

  return {
    isValid: true,
    errors: {},
    profile: {
      name: formValues.name.trim(),
      department: formValues.department,
      cgpa: Number(parsedCgpa.toFixed(2)),
      gender: formValues.gender,
      needBased: normalizedNeedBased,
    },
  };
}
