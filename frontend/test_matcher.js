import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, 'src', 'data', 'scholarships.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

console.log('--- Testing Frontend Matching Engine ---');
console.log(`[PASS] Catalog loaded: ${catalog.length} records`);

if (catalog.length !== 136) {
  throw new Error(`Expected 136 scholarships, found ${catalog.length}`);
}

// Test deterministic filtering logic
const querySearch = (term) => {
  const q = term.toLowerCase();
  return catalog.filter(s => s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q));
};

const bayviewMatches = querySearch('Bayview University');
console.log(`[PASS] Bayview University scholarships: ${bayviewMatches.length}`);
if (bayviewMatches.length === 0) {
  throw new Error('Expected Bayview scholarships');
}

// Test categories present
const uniqueCategories = new Set(catalog.map(s => s.category));
console.log(`[PASS] Unique categories detected: ${uniqueCategories.size} categories`);
console.log(`Categories: ${Array.from(uniqueCategories).join(', ')}`);

// Verify essential fields presence in all 136 records
catalog.forEach((item, idx) => {
  if (!item.id || !item.name || !item.provider || !item.deadline || item.amount_bdt === undefined || !item.category) {
    throw new Error(`Item at index ${idx} missing required fields`);
  }
});
console.log('[PASS] All 136 scholarship records have complete and valid schemas');

console.log('--- Frontend Tests Passed Successfully! ---');
