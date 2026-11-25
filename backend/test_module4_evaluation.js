import {
  evaluateStudentScholarships,
  inspectStudentProfile,
  compareScholarshipRequirements,
  classifyEligibility,
  ELIGIBILITY_STATUS,
} from './src/services/evaluationService.js';
import scholarshipService from './src/services/csvService.js';

console.log('====================================================');
console.log('🎓 MODULE 4: AUDITED ELIGIBILITY EVALUATION TEST SUITE');
console.log('====================================================\n');

// 1. Ensure dataset is loaded
const dataset = scholarshipService.loadDataset();
console.log(`[PASS] Ingested official scholarship dataset: ${dataset.length} records.`);
if (dataset.length !== 136) {
  throw new Error(`Expected 136 records, got ${dataset.length}`);
}

// -----------------------------------------------------------------------------
// Audit Test 1: Complete Eligible Student Profile (Ayesha Rahman)
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 1: Standard Complete Profile (Ayesha Rahman) ---');
const completeEligibleProfile = {
  name: 'Ayesha Rahman',
  department: 'CSE',
  cgpa: 3.85,
  gender: 'Female',
  needBased: true,
  hasPortfolio: true,
  hasVolunteerHours: true,
};

const inspected1 = inspectStudentProfile(completeEligibleProfile);
console.log(`[PASS] Profile validation: isValid = ${inspected1.isValid}, isComplete = ${inspected1.isComplete}, missingFields = [${inspected1.missingFields.join(', ')}]`);
if (!inspected1.isValid || !inspected1.isComplete) {
  throw new Error('Audit Test 1 profile should be valid and complete');
}

const evalResult1 = evaluateStudentScholarships(completeEligibleProfile);
console.log(`[PASS] Eligible Scholarships: ${evalResult1.classification.eligible.length} (Expected: 81)`);
console.log(`[PASS] Potentially Eligible Scholarships: ${evalResult1.classification.potentiallyEligible.length} (Expected: 14)`);
console.log(`[PASS] Not Eligible Scholarships: ${evalResult1.classification.notEligible.length} (Expected: 41)`);
console.log(`[PASS] Total Evaluated: ${evalResult1.summary.totalScholarships}`);

if (evalResult1.classification.eligible.length !== 81 ||
    evalResult1.classification.potentiallyEligible.length !== 14 ||
    evalResult1.classification.notEligible.length !== 41) {
  throw new Error(`Unexpected partition counts for Ayesha: ${evalResult1.classification.eligible.length}, ${evalResult1.classification.potentiallyEligible.length}, ${evalResult1.classification.notEligible.length}`);
}

// Verify Exact Partitioning: eligible (81) + potentiallyEligible (14) + notEligible (41) === 136
const sum1 = evalResult1.classification.eligible.length +
  evalResult1.classification.potentiallyEligible.length +
  evalResult1.classification.notEligible.length;
if (sum1 !== 136) {
  throw new Error(`Catalog partitioning mismatch: ${sum1} !== 136`);
}
console.log(`[PASS] Catalog Partitioning Verified: 81 + 14 + 41 === 136`);

// -----------------------------------------------------------------------------
// Audit Test 1B: Complete Profile with Explicit Negative Prerequisite Flags
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 1B: Profile with Explicit Negative Prerequisite Flags ---');
const profileWithNegativeFlags = {
  ...completeEligibleProfile,
  hasSportsExcellence: false,
  isFirstGeneration: false,
  hasDisability: false,
};
const evalResult1B = evaluateStudentScholarships(profileWithNegativeFlags);
console.log(`[PASS] With negative flags: Eligible = ${evalResult1B.classification.eligible.length} (81), Potentially = ${evalResult1B.classification.potentiallyEligible.length} (7), Not Eligible = ${evalResult1B.classification.notEligible.length} (48)`);
// Explaining why potentially drops from 14 to 7:
// The 7 scholarships requiring sports (4), first generation (2), or disability (1) become hard-disqualified (Not Eligible)
if (evalResult1B.classification.potentiallyEligible.length !== 7 || evalResult1B.classification.notEligible.length !== 48) {
  throw new Error('Explicit negative flags should convert 7 unconfirmed prerequisites into Not Eligible');
}
console.log('[PASS] Negative flags properly converted 7 unconfirmed prerequisites to Not Eligible (14 -> 7 Potentially Eligible).');

// -----------------------------------------------------------------------------
// Audit Test 2: No Invented Degree or Country Restrictions
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 2: No Invented Degree or Country Restrictions ---');
const bayviewMerit = dataset.find((s) => s.id === 1); // Merit Excellence Award, min_cgpa 3.8, dept All
const compBayview = compareScholarshipRequirements(bayviewMerit, {
  name: 'Test Student',
  department: 'CSE',
  cgpa: 3.90,
  gender: 'Male',
  needBased: false,
});
console.log(`[PASS] Scholarship ID 1 degree status: ${compBayview.degreeLevel.status} (Expected: NOT_APPLICABLE)`);
console.log(`[PASS] Scholarship ID 1 country status: ${compBayview.countryRestriction.status} (Expected: NOT_APPLICABLE)`);
if (compBayview.degreeLevel.status !== 'NOT_APPLICABLE' || compBayview.countryRestriction.status !== 'NOT_APPLICABLE') {
  throw new Error('[FAIL] Inappropriate degree/country restriction was invented for a standard scholarship');
}

// -----------------------------------------------------------------------------
// Audit Test 3: Strict Minimum CGPA Enforcement (No 0.35 Deficit Pass)
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 3: Strict Minimum CGPA Enforcement (No 0.35 Deficit Pass) ---');
const studentBelowCutoff = {
  name: 'Sadia Chowdhury',
  department: 'CSE',
  cgpa: 3.40, // 0.10 below 3.50 scholarships
  gender: 'Female',
  needBased: true,
};

const compScholarship35 = compareScholarshipRequirements(
  { id: 2, min_cgpa: 3.5, department: 'CSE;EEE;CE', gender: 'All', need_based: 'no', description: 'For engineering students' },
  studentBelowCutoff
);
console.log(`[PASS] CGPA 3.40 vs 3.50 cutoff comparison status: ${compScholarship35.cgpa.status}`);
if (compScholarship35.cgpa.status !== 'FAILED') {
  throw new Error('[FAIL] CGPA below minimum was not marked as FAILED');
}
const classScholarship35 = classifyEligibility(compScholarship35);
console.log(`[PASS] CGPA 3.40 vs 3.50 classification: ${classScholarship35.status}`);
if (classScholarship35.status !== ELIGIBILITY_STATUS.NOT_ELIGIBLE) {
  throw new Error('[FAIL] Student with CGPA below cutoff must be classified as NOT_ELIGIBLE');
}

// -----------------------------------------------------------------------------
// Audit Test 4: Incomplete Info Triggers Potentially Eligible Only When Decision Is Prevented
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 4: Incomplete Info Triggers Potentially Eligible Only When Decision Is Prevented ---');
const scholarshipRequiringProject = dataset.find((s) => s.id === 3); // Coders of Tomorrow Grant, requires software project
const studentWithoutPortfolioSpecified = {
  name: 'Nusrat Jahan',
  department: 'CSE',
  cgpa: 3.75, // Meets 3.20 cutoff
  gender: 'Female',
  needBased: false,
};
const evalProjectScholarship = compareScholarshipRequirements(scholarshipRequiringProject, studentWithoutPortfolioSpecified);
const classProject = classifyEligibility(evalProjectScholarship);
console.log(`[PASS] Prerequisite unconfirmed: classification = ${classProject.status}, reason = ${classProject.classificationReason}`);
if (classProject.status !== ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE) {
  throw new Error('[FAIL] Unconfirmed required prerequisite must classify as POTENTIALLY_ELIGIBLE');
}

const studentFailedCgpaAndNoPortfolio = {
  name: 'Fahim Ahmed',
  department: 'CSE',
  cgpa: 2.50, // Fails 3.20 cutoff
  gender: 'Male',
  needBased: false,
};
const evalFailedCgpa = compareScholarshipRequirements(scholarshipRequiringProject, studentFailedCgpaAndNoPortfolio);
const classFailedCgpa = classifyEligibility(evalFailedCgpa);
console.log(`[PASS] Disqualified student on prerequisite scholarship: classification = ${classFailedCgpa.status}`);
if (classFailedCgpa.status !== ELIGIBILITY_STATUS.NOT_ELIGIBLE) {
  throw new Error('[FAIL] Student failing mandatory CGPA must be NOT_ELIGIBLE even if portfolio is unconfirmed');
}

// -----------------------------------------------------------------------------
// Audit Test 5: Missing-CGPA Profiles (Nusrat vs Tanvir)
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 5: Missing-CGPA Profiles (Demographic & Departmental Impact) ---');
// Profile A: Nusrat Jahan (BBA, Female, Need-Based)
const nusratMissingCgpa = {
  name: 'Nusrat Jahan',
  department: 'BBA',
  cgpa: '',
  gender: 'Female',
  needBased: true,
};
const evalNusrat = evaluateStudentScholarships(nusratMissingCgpa);
console.log(`[PASS] Nusrat (BBA, Female, Need-Based): Eligible = ${evalNusrat.classification.eligible.length} (0), Potentially = ${evalNusrat.classification.potentiallyEligible.length} (81), Not Eligible = ${evalNusrat.classification.notEligible.length} (55)`);
if (evalNusrat.classification.potentiallyEligible.length !== 81 || evalNusrat.classification.notEligible.length !== 55) {
  throw new Error(`Unexpected counts for Nusrat missing CGPA: ${evalNusrat.classification.potentiallyEligible.length}, ${evalNusrat.classification.notEligible.length}`);
}

// Profile B: Tanvir Hossain (EEE, Male, Merit-Only)
const tanvirMissingCgpa = {
  name: 'Tanvir Hossain',
  department: 'EEE',
  cgpa: '',
  gender: 'Male',
  needBased: false,
};
const evalTanvir = evaluateStudentScholarships(tanvirMissingCgpa);
console.log(`[PASS] Tanvir (EEE, Male, Merit-Only): Eligible = ${evalTanvir.classification.eligible.length} (0), Potentially = ${evalTanvir.classification.potentiallyEligible.length} (47), Not Eligible = ${evalTanvir.classification.notEligible.length} (89)`);
if (evalTanvir.classification.potentiallyEligible.length !== 47 || evalTanvir.classification.notEligible.length !== 89) {
  throw new Error(`Unexpected counts for Tanvir missing CGPA: ${evalTanvir.classification.potentiallyEligible.length}, ${evalTanvir.classification.notEligible.length}`);
}
console.log('[PASS] Demographic consistency verified: Nusrat qualifies for 81 awards awaiting CGPA (Female + Need), while Tanvir is disqualified from 89 by gender/need/dept restrictions, leaving 47 awaiting CGPA.');

// -----------------------------------------------------------------------------
// Audit Test 6: Explanations Verification
// -----------------------------------------------------------------------------
console.log('\n--- Audit Test 6: Explanations Transparency ---');
const sampleEval = evalResult1.classification.eligible[0];
console.log(`[PASS] Sample Eligible: "${sampleEval.scholarship.name}"`);
console.log(`  - Narrative: "${sampleEval.explanation.narrativeExplanation}"`);
console.log(`  - Satisfied Conditions (${sampleEval.explanation.satisfiedConditions.length}):`);
sampleEval.explanation.satisfiedConditions.forEach((sc) => console.log(`    * ${sc}`));
if (sampleEval.explanation.satisfiedConditions.length === 0) {
  throw new Error('[FAIL] Eligible scholarship must list satisfied conditions');
}
if (sampleEval.explanation.missingRequirements.length !== 0) {
  throw new Error('[FAIL] Eligible scholarship cannot have missing requirements');
}

console.log('\n====================================================');
console.log('✅ ALL MODULE 4 AUDIT TESTS PASSED SUCCESSFULLY!');
console.log('====================================================\n');
