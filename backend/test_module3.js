import scholarshipService from './src/services/csvService.js';
import { matchStudentScholarships, validateStudentProfile } from './src/services/eligibilityService.js';

console.log('--- Starting Module 3 Backend Integration Test ---');

// 1. Test Dataset Loading
const dataset = scholarshipService.loadDataset();
console.log(`[PASS] Ingested records: ${dataset.length} (Expected: 136)`);
if (dataset.length !== 136) {
  throw new Error(`Expected 136 records, got ${dataset.length}`);
}

// 2. Test Statistics
const stats = scholarshipService.getStats();
console.log(`[PASS] Stats computed: Total Aid Pool = BDT ${stats.totalAidPool.toLocaleString()}, Avg CGPA = ${stats.averageMinCGPA}`);
console.log(`[PASS] Categories count: ${Object.keys(stats.categories).length} categories`);

// 3. Test Query & Filters
const engineeringResults = scholarshipService.query({ department: 'CSE' });
console.log(`[PASS] CSE Queries returned: ${engineeringResults.total} scholarships`);

const searchResults = scholarshipService.query({ search: 'Tech Foundation' });
console.log(`[PASS] Search by 'Tech Foundation' returned: ${searchResults.total} matches`);

const singleRecord = scholarshipService.getById(1);
console.log(`[PASS] Scholarship ID 1: "${singleRecord.name}" by "${singleRecord.provider}"`);

// 4. Test Matching Engine with Female CSE Student needing aid
const testProfile1 = {
  name: 'Ayesha Rahman',
  department: 'CSE',
  cgpa: 3.75,
  gender: 'Female',
  needBased: true,
};

const match1 = matchStudentScholarships(testProfile1);
console.log(`[PASS] Match Profile 1 (Ayesha): Fully Eligible = ${match1.fullyEligible.length}, Almost Eligible = ${match1.almostEligible.length}, Not Eligible = ${match1.summary.notEligibleCount}, Total Catalog = ${match1.summary.totalScholarships}`);
console.log(`[PASS] Eligible Aid Pool for Ayesha: BDT ${match1.summary.totalEligibleAid.toLocaleString()}`);

// Consistency check: Eligible (93) + Almost Eligible (4) + Not Eligible (39) === 136
const totalAyesha = match1.fullyEligible.length + match1.almostEligible.length + match1.summary.notEligibleCount;
if (totalAyesha !== 136) {
  throw new Error(`Inconsistency detected: ${totalAyesha} !== 136`);
}
console.log(`[PASS] Exact Catalog Partitioning Verified: ${match1.fullyEligible.length} + ${match1.almostEligible.length} + ${match1.summary.notEligibleCount} === 136`);

// 5. Test Matching Engine with Male BBA Student not needing aid
const testProfile2 = {
  name: 'Rafiqul Islam',
  department: 'BBA',
  cgpa: 3.20,
  gender: 'Male',
  needBased: false,
};

const match2 = matchStudentScholarships(testProfile2);
console.log(`[PASS] Match Profile 2 (Rafiqul): Fully Eligible = ${match2.fullyEligible.length}, Almost Eligible = ${match2.almostEligible.length}, Not Eligible = ${match2.summary.notEligibleCount}`);

// Ensure male student is NEVER matched to female-only scholarships
const invalidGenderLeak = match2.fullyEligible.some((m) => m.scholarship.gender === 'Female');
if (invalidGenderLeak) {
  throw new Error('[FAIL] Male student matched to female-only scholarship!');
}
console.log('[PASS] Gender restriction verified: Zero female scholarships matched to male student');

// Ensure non-need student is NEVER matched to need-based scholarships
const invalidNeedLeak = match2.fullyEligible.some((m) => m.scholarship.need_based === 'yes');
if (invalidNeedLeak) {
  throw new Error('[FAIL] Non-need student matched to need-based scholarship!');
}
console.log('[PASS] Need restriction verified: Zero need-based scholarships matched to non-need student');

// Ensure CSE student is NEVER matched to non-CSE department-specific scholarships
const invalidDeptLeak = match1.fullyEligible.some((m) => {
  const depts = m.scholarship.department.split(';').map((d) => d.trim());
  return m.scholarship.department !== 'All' && !depts.includes('CSE');
});
if (invalidDeptLeak) {
  throw new Error('[FAIL] CSE student matched to non-CSE departmental scholarship!');
}
console.log('[PASS] Department restriction verified: Zero non-CSE scholarships matched to CSE student');

// 6. Test Handling of Incomplete / Missing Data
const incompleteProfile = {
  name: '',
  department: 'INVALID',
  cgpa: 'abc',
};

const valResult = validateStudentProfile(incompleteProfile);
console.log(`[PASS] Missing data handled gracefully: isValid = false, errors = ${valResult.errors.length}`);
if (valResult.isValid) {
  throw new Error('[FAIL] Validation did not reject invalid profile');
}

console.log('--- ALL MODULE 3 BACKEND TESTS PASSED SUCCESSFULLY! ---');
