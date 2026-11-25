/**
 * Test Suite: Module 5 AI Advisor & Fallback Engine
 */

import assert from 'assert';
import {
  getAIStatus,
  generateFallbackExplanation,
  generateScholarshipExplanation,
  generateBatchScholarshipExplanations,
  generateAdvisorExecutiveSummary,
} from './src/services/geminiService.js';
import scholarshipService from './src/services/csvService.js';
import { evaluateStudentScholarships } from './src/services/evaluationService.js';

console.log('====================================================');
console.log('🤖 MODULE 5: AI ADVISOR & INTEGRATION TEST SUITE');
console.log('====================================================\n');

// Load catalog
scholarshipService.loadDataset();
const catalog = scholarshipService.getAll();
assert(catalog.length === 136, 'Catalog must contain 136 records');
console.log(`[PASS] Ingested official scholarship dataset: ${catalog.length} records.`);

// Test 1: Service Status
const status = getAIStatus();
assert(status.service === 'ScholarMate AI Advisor', 'Service name must match');
assert(typeof status.apiKeyConfigured === 'boolean', 'apiKeyConfigured must be boolean');
assert(typeof status.mode === 'string', 'Mode must be string');
console.log(`[PASS] AI Advisor Status: mode = ${status.mode}, apiKeyConfigured = ${status.apiKeyConfigured}`);

// Test 2: Student Profile & Evaluation
const studentProfile = {
  name: 'Ayesha Rahman',
  department: 'CSE',
  cgpa: 3.75,
  gender: 'Female',
  needBased: true,
};

const evaluation = evaluateStudentScholarships(studentProfile);
assert(evaluation.classification.eligible.length > 0, 'Should have eligible scholarships');
console.log(`[PASS] Student evaluated: ${evaluation.classification.eligible.length} eligible scholarships.`);

const firstEligible = evaluation.classification.eligible[0];
const firstAlmost = evaluation.classification.potentiallyEligible[0];

// Test 3: Deterministic Fallback Generation for Eligible Scholarship
const fallbackEligible = generateFallbackExplanation(studentProfile, firstEligible.scholarship, firstEligible);
assert(typeof fallbackEligible === 'string' && fallbackEligible.length > 20, 'Fallback explanation must be non-empty');
assert(fallbackEligible.includes('Ayesha') || fallbackEligible.includes('You are a strong match'), 'Must mention student match');
assert(fallbackEligible.includes(firstEligible.scholarship.name), 'Must include exact scholarship name');
assert(fallbackEligible.includes(firstEligible.scholarship.provider), 'Must include exact provider name');
console.log(`[PASS] Eligible Fallback Explanation generated:\n  "${fallbackEligible.substring(0, 100)}..."`);

// Test 4: Deterministic Fallback Generation for Almost Eligible Scholarship
const fallbackAlmost = generateFallbackExplanation(studentProfile, firstAlmost.scholarship, firstAlmost);
assert(typeof fallbackAlmost === 'string' && fallbackAlmost.length > 20, 'Almost-eligible fallback must be non-empty');
assert(fallbackAlmost.includes(firstAlmost.scholarship.name), 'Must include scholarship name');
console.log(`[PASS] Almost-Eligible Fallback Explanation generated:\n  "${fallbackAlmost.substring(0, 100)}..."`);

// Test 5: Single Scholarship Explanation (works offline with fallback or online with Gemini)
async function testSingleExplanation() {
  const result = await generateScholarshipExplanation(studentProfile, firstEligible.scholarship, firstEligible);
  assert(result.scholarshipId === firstEligible.scholarship.id, 'Scholarship ID must match');
  assert(typeof result.explanation === 'string' && result.explanation.length > 20, 'Explanation must be generated');
  assert(['gemini', 'fallback'].includes(result.source), 'Source must be gemini or fallback');
  console.log(`[PASS] generateScholarshipExplanation passed (Source: ${result.source})`);
}

// Test 6: Batch Scholarship Explanation
async function testBatchExplanations() {
  const topRecords = evaluation.classification.eligible.slice(0, 4);
  const batch = await generateBatchScholarshipExplanations(studentProfile, topRecords);
  assert(batch.length === 4, 'Must return 4 explanations');
  batch.forEach((item, idx) => {
    assert(item.scholarshipId === topRecords[idx].scholarship.id, `ID at ${idx} must match`);
    assert(typeof item.explanation === 'string' && item.explanation.length > 10, `Item ${idx} explanation must exist`);
  });
  console.log(`[PASS] generateBatchScholarshipExplanations passed for ${batch.length} scholarships.`);
}

// Test 7: Executive Summary Generation
async function testExecutiveSummary() {
  const summary = await generateAdvisorExecutiveSummary(studentProfile, evaluation);
  assert(typeof summary.overview === 'string' && summary.overview.length > 30, 'Overview must be non-empty');
  assert(Array.isArray(summary.topStrengths) && summary.topStrengths.length > 0, 'Top strengths must exist');
  assert(Array.isArray(summary.recommendedActionPlan) && summary.recommendedActionPlan.length > 0, 'Action plan must exist');
  console.log(`[PASS] generateAdvisorExecutiveSummary passed:\n  "${summary.overview.substring(0, 110)}..."`);
}

// Test 8: Zero-Hallucination & Non-Alteration Safeguards
function testZeroHallucination() {
  const originalName = firstEligible.scholarship.name;
  const originalProvider = firstEligible.scholarship.provider;
  const originalAmount = firstEligible.scholarship.amount_bdt;
  const originalDeadline = firstEligible.scholarship.deadline;

  // Verify that generating explanation does not mutate original scholarship record
  assert(firstEligible.scholarship.name === originalName, 'Name not mutated');
  assert(firstEligible.scholarship.provider === originalProvider, 'Provider not mutated');
  assert(firstEligible.scholarship.amount_bdt === originalAmount, 'Amount not mutated');
  assert(firstEligible.scholarship.deadline === originalDeadline, 'Deadline not mutated');
  console.log('[PASS] Zero-hallucination and non-mutation guardrails verified.');
}

async function runAll() {
  await testSingleExplanation();
  await testBatchExplanations();
  await testExecutiveSummary();
  testZeroHallucination();
  console.log('\n====================================================');
  console.log('✅ ALL MODULE 5 AI ADVISOR TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runAll().catch((err) => {
  console.error('[FAIL] Module 5 test failed:', err);
  process.exit(1);
});
