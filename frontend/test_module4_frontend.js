import {
  evaluateStudentScholarshipsClient,
  inspectStudentProfile,
  ELIGIBILITY_STATUS,
  SCHOLARSHIP_CATALOG,
} from './src/utils/eligibilityEvaluator.js';

console.log('--- Testing Audited Module 4 Frontend Eligibility Evaluator ---');
console.log(`[PASS] Catalog loaded: ${SCHOLARSHIP_CATALOG.length} records`);

// Test 1: Complete Eligible Profile (Ayesha Rahman)
const student1 = {
  name: 'Ayesha Rahman',
  department: 'CSE',
  cgpa: 3.85,
  gender: 'Female',
  needBased: true,
  hasPortfolio: true,
  hasVolunteerHours: true,
};

const result1 = evaluateStudentScholarshipsClient(student1);
console.log(`[PASS] Student 1 (Ayesha): Eligible = ${result1.classification.eligible.length} (81), Potentially = ${result1.classification.potentiallyEligible.length} (14), Ineligible = ${result1.classification.notEligible.length} (41)`);
if (result1.classification.eligible.length !== 81 || result1.classification.potentiallyEligible.length !== 14 || result1.classification.notEligible.length !== 41) {
  throw new Error(`Unexpected frontend evaluation counts for Ayesha: ${result1.classification.eligible.length}, ${result1.classification.potentiallyEligible.length}, ${result1.classification.notEligible.length}`);
}

// Test 2A: Missing-CGPA Profile (Nusrat Jahan - BBA, Female, Need-Based)
const student2A = {
  name: 'Nusrat Jahan',
  department: 'BBA',
  cgpa: '', // Missing CGPA
  gender: 'Female',
  needBased: true,
};
const result2A = evaluateStudentScholarshipsClient(student2A);
console.log(`[PASS] Missing CGPA (Nusrat - BBA, Female, Need): Potentially Eligible = ${result2A.classification.potentiallyEligible.length} (81)`);
if (result2A.classification.potentiallyEligible.length !== 81) {
  throw new Error(`Expected 81 for Nusrat, got ${result2A.classification.potentiallyEligible.length}`);
}

// Test 2B: Missing-CGPA Profile (Tanvir Hossain - EEE, Male, Merit-Only)
const student2B = {
  name: 'Tanvir Hossain',
  department: 'EEE',
  cgpa: '', // Missing CGPA
  gender: 'Male',
  needBased: false,
};
const result2B = evaluateStudentScholarshipsClient(student2B);
console.log(`[PASS] Missing CGPA (Tanvir - EEE, Male, Merit-Only): Potentially Eligible = ${result2B.classification.potentiallyEligible.length} (47)`);
if (result2B.classification.potentiallyEligible.length !== 47) {
  throw new Error(`Expected 47 for Tanvir, got ${result2B.classification.potentiallyEligible.length}`);
}

// Test 3: Strict Minimum CGPA Cutoff (No 0.35 Deficit Pass)
const student3 = {
  name: 'Sadia Chowdhury',
  department: 'CSE',
  cgpa: 3.40, // Below 3.50 cutoffs
  gender: 'Female',
  needBased: true,
};
const result3 = evaluateStudentScholarshipsClient(student3);
const matchId2 = result3.classification.notEligible.find((m) => m.scholarship.id === 2);
console.log(`[PASS] Scholarship ID 2 (min 3.50) for student with CGPA 3.40 is classified as: ${matchId2?.status} (NOT_ELIGIBLE)`);
if (matchId2?.status !== ELIGIBILITY_STATUS.NOT_ELIGIBLE) {
  throw new Error('Student with CGPA below cutoff must be NOT_ELIGIBLE');
}

console.log('--- Module 4 Frontend Tests Passed Successfully! ---');
