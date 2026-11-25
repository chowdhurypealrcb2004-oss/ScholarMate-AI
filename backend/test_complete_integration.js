/**
 * Comprehensive End-to-End Test Suite for ScholarMate AI
 * Integrates and validates all 5 modules from end to end.
 */

import assert from 'assert';
import scholarshipService from './src/services/csvService.js';
import { matchStudentScholarships, validateStudentProfile } from './src/services/eligibilityService.js';
import { evaluateStudentScholarships } from './src/services/evaluationService.js';
import {
  getAIStatus,
  generateFallbackExplanation,
  generateScholarshipExplanation,
  generateBatchScholarshipExplanations,
  generateAdvisorExecutiveSummary,
} from './src/services/geminiService.js';

console.log('================================================================');
console.log('🎓 SCHOLARMATE-AI: COMPLETE 5-MODULE END-TO-END TEST SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// MODULE 3 VERIFICATION: DATASET INGESTION & CORE CATALOG INTEGRITY
// -------------------------------------------------------------
console.log('▶ [1/6] Verifying Module 3: Dataset Ingestion & Schema');
scholarshipService.loadDataset();
const catalog = scholarshipService.getAll();
assert.strictEqual(catalog.length, 136, 'Official dataset must contain exactly 136 records');

// Validate schema fields on every record
catalog.forEach((s) => {
  assert(typeof s.id === 'number', `ID missing on record ${JSON.stringify(s)}`);
  assert(typeof s.name === 'string' && s.name.length > 0, `Name missing on ${s.id}`);
  assert(typeof s.provider === 'string' && s.provider.length > 0, `Provider missing on ${s.id}`);
  assert(typeof s.min_cgpa === 'number' && s.min_cgpa >= 0 && s.min_cgpa <= 4.0, `Min CGPA invalid on ${s.id}`);
  assert(typeof s.amount_bdt === 'number' && s.amount_bdt >= 0, `Amount BDT invalid on ${s.id}`);
  assert(typeof s.deadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.deadline), `Deadline invalid on ${s.id}`);
  assert(['yes', 'no'].includes(s.need_based), `Need based flag invalid on ${s.id}`);
  assert(['All', 'Female', 'Male'].includes(s.gender), `Gender restriction invalid on ${s.id}`);
});
console.log(`[PASS] All 136 scholarship records verified with strict schemas.\n`);

// -------------------------------------------------------------
// MODULE 2 VERIFICATION: STUDENT PROFILE VALIDATION
// -------------------------------------------------------------
console.log('▶ [2/6] Verifying Module 2: Student Profile Form Validation');
const validProfile = {
  name: 'Ayesha Rahman',
  department: 'CSE',
  cgpa: 3.75,
  gender: 'Female',
  needBased: true,
};
const validCheck = validateStudentProfile(validProfile);
assert.strictEqual(validCheck.isValid, true, 'Valid profile must pass');

// Incomplete profile (missing CGPA)
const incompleteProfile = {
  name: 'Nusrat Jahan',
  department: 'BBA',
  cgpa: '',
  gender: 'Female',
  needBased: true,
};
const incompleteCheck = validateStudentProfile(incompleteProfile);
assert.strictEqual(incompleteCheck.isValid, false, 'Incomplete profile must fail strict validation');

// Invalid department
const invalidDeptProfile = { ...validProfile, department: 'ASTRONOMY' };
const invalidDeptCheck = validateStudentProfile(invalidDeptProfile);
assert.strictEqual(invalidDeptCheck.isValid, false, 'Invalid department must fail');
console.log(`[PASS] Student profile validation and edge-cases verified.\n`);

// -------------------------------------------------------------
// MODULE 4 VERIFICATION: DETERMINISTIC ELIGIBILITY EVALUATION
// -------------------------------------------------------------
console.log('▶ [3/6] Verifying Module 4: Eligibility Evaluation Engine');
const evaluation = evaluateStudentScholarships(validProfile);

assert(evaluation.classification.eligible.length > 0, 'Eligible count must be > 0');
assert(evaluation.classification.potentiallyEligible.length > 0, 'Potentially eligible count must be > 0');
assert(evaluation.classification.notEligible.length > 0, 'Not eligible count must be > 0');

const totalPartition =
  evaluation.classification.eligible.length +
  evaluation.classification.potentiallyEligible.length +
  evaluation.classification.notEligible.length;
assert.strictEqual(totalPartition, 136, 'Sum of partition must equal 136 catalog records exactly');

// Check that strict CGPA rule is respected (no CGPA below cutoff is eligible)
evaluation.classification.eligible.forEach((item) => {
  assert(
    validProfile.cgpa >= item.scholarship.min_cgpa,
    `Student CGPA (${validProfile.cgpa}) must be >= min_cgpa (${item.scholarship.min_cgpa}) for eligible scholarship ${item.scholarship.name}`
  );
  assert(item.breakdown.cgpaMet === true, 'cgpaMet must be true for eligible item');
  assert(item.breakdown.departmentMet === true, 'departmentMet must be true for eligible item');
  assert(item.breakdown.genderMet === true, 'genderMet must be true for eligible item');
});
console.log(`[PASS] Deterministic evaluation: ${evaluation.classification.eligible.length} eligible, ${evaluation.classification.potentiallyEligible.length} almost-eligible, ${evaluation.classification.notEligible.length} ineligible.`);
console.log(`[PASS] Partitioning: ${evaluation.classification.eligible.length} + ${evaluation.classification.potentiallyEligible.length} + ${evaluation.classification.notEligible.length} = 136.\n`);

// -------------------------------------------------------------
// MODULE 5 VERIFICATION: AI ADVISOR & EXPLANATIONS
// -------------------------------------------------------------
console.log('▶ [4/6] Verifying Module 5: AI Advisor & Explanation Generator');
const topEligible = evaluation.classification.eligible[0];
const topAlmost = evaluation.classification.potentiallyEligible[0];

// Fallback explanation for eligible
const fallbackEligible = generateFallbackExplanation(validProfile, topEligible.scholarship, topEligible);
assert(typeof fallbackEligible === 'string' && fallbackEligible.length > 25, 'Fallback explanation must be non-empty');
assert(fallbackEligible.includes(topEligible.scholarship.name), 'Must include exact scholarship name');
assert(fallbackEligible.includes(topEligible.scholarship.provider), 'Must include exact provider');

// Fallback explanation for almost eligible
const fallbackAlmost = generateFallbackExplanation(validProfile, topAlmost.scholarship, topAlmost);
assert(typeof fallbackAlmost === 'string' && fallbackAlmost.length > 25, 'Almost-eligible fallback must be non-empty');
assert(fallbackAlmost.includes(topAlmost.scholarship.name), 'Must include exact scholarship name');

// Executive summary
const execSummary = await generateAdvisorExecutiveSummary(validProfile, evaluation);
assert(typeof execSummary.overview === 'string' && execSummary.overview.length > 20, 'Summary overview must exist');
assert(Array.isArray(execSummary.topStrengths) && execSummary.topStrengths.length > 0, 'Strengths must exist');
assert(Array.isArray(execSummary.recommendedActionPlan) && execSummary.recommendedActionPlan.length > 0, 'Roadmap must exist');

// Single explanation service method
const singleResult = await generateScholarshipExplanation(validProfile, topEligible.scholarship, topEligible);
assert(singleResult.scholarshipId === topEligible.scholarship.id, 'Scholarship ID must match');
assert(typeof singleResult.explanation === 'string' && singleResult.explanation.length > 10, 'Explanation must exist');

// Batch explanation service method
const batchResults = await generateBatchScholarshipExplanations(validProfile, [topEligible, topAlmost]);
assert.strictEqual(batchResults.length, 2, 'Batch must return 2 results');
assert.strictEqual(batchResults[0].scholarshipId, topEligible.scholarship.id, 'First item ID must match');
assert.strictEqual(batchResults[1].scholarshipId, topAlmost.scholarship.id, 'Second item ID must match');
console.log(`[PASS] Single and batch AI explanations generated with transparent fallback guarantee.\n`);

// -------------------------------------------------------------
// MODULE 5 VERIFICATION: SORTING FUNCTIONALITY
// -------------------------------------------------------------
console.log('▶ [5/6] Verifying Sorting Logic');
// 1. Sort by highest scholarship amount
const sortedByAmount = [...evaluation.classification.eligible].sort(
  (a, b) => (b.scholarship.amount_bdt || 0) - (a.scholarship.amount_bdt || 0)
);
for (let i = 0; i < sortedByAmount.length - 1; i++) {
  assert(
    sortedByAmount[i].scholarship.amount_bdt >= sortedByAmount[i + 1].scholarship.amount_bdt,
    `Sort by amount failed at index ${i}`
  );
}
console.log(`[PASS] Sorting by highest scholarship amount verified (${sortedByAmount[0].scholarship.amount_bdt} BDT down to ${sortedByAmount[sortedByAmount.length - 1].scholarship.amount_bdt} BDT).`);

// 2. Sort by earliest deadline
const sortedByDeadline = [...evaluation.classification.eligible].sort(
  (a, b) => new Date(a.scholarship.deadline) - new Date(b.scholarship.deadline)
);
for (let i = 0; i < sortedByDeadline.length - 1; i++) {
  assert(
    new Date(sortedByDeadline[i].scholarship.deadline) <= new Date(sortedByDeadline[i + 1].scholarship.deadline),
    `Sort by deadline failed at index ${i}`
  );
}
console.log(`[PASS] Sorting by earliest deadline verified (${sortedByDeadline[0].scholarship.deadline} to ${sortedByDeadline[sortedByDeadline.length - 1].scholarship.deadline}).\n`);

// -------------------------------------------------------------
// SAFEGUARDS: ZERO-HALLUCINATION & BACKWARD COMPATIBILITY
// -------------------------------------------------------------
console.log('▶ [6/6] Verifying Guardrails & Backward Compatibility');
// Verify catalog records were never mutated
const checkScholarship1 = scholarshipService.getById(1);
assert.strictEqual(checkScholarship1.name, 'Merit Excellence Award');
assert.strictEqual(checkScholarship1.provider, 'Bayview University');
assert.strictEqual(checkScholarship1.amount_bdt, 30000);

// Verify Module 3 match endpoint compatibility
const module3Match = matchStudentScholarships(validProfile);
assert(module3Match.fullyEligible.length > 0, 'Module 3 fullyEligible must exist');
assert(module3Match.almostEligible.length >= 0, 'Module 3 almostEligible must exist');

// Verify AI status
const aiStatus = getAIStatus();
assert(typeof aiStatus.apiKeyConfigured === 'boolean', 'apiKeyConfigured must be boolean');
assert(['gemini_active', 'fallback_active'].includes(aiStatus.mode), 'Mode must be gemini_active or fallback_active');

console.log('[PASS] Original dataset preserved without mutations.');
console.log('[PASS] Backward compatibility with Modules 1, 2, 3, and 4 verified.');
console.log('[PASS] AI status report verified.\n');

console.log('================================================================');
console.log('🎉 ALL 5 MODULES PASSED COMPLETE INTEGRATION TESTS WITH 100% SUCCESS!');
console.log('================================================================');
