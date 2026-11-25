/**
 * ScholarMate AI - Live Gemini API Verification Script
 *
 * Verifies whether an actual live Gemini API connection can be established
 * using the credentials defined in backend/.env.
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

console.log('====================================================');
console.log('🔍 SCHOLARMATE-AI: LIVE GEMINI API VERIFICATION');
console.log('====================================================\n');

console.log(`1. Target Model: ${modelName}`);

if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key_here')) {
  console.log('2. API Key Status: NOT CONFIGURED (or placeholder)');
  console.log('\n[INFO] backend/.env does not contain an active GEMINI_API_KEY.');
  console.log('The application will operate in high-reliability deterministic fallback mode.');
  console.log('To activate live Gemini AI:');
  console.log('  1. Create backend/.env by copying backend/.env.example:');
  console.log('     copy backend\\.env.example backend\\.env');
  console.log('  2. Put your real Google Gemini API key in backend/.env:');
  console.log('     GEMINI_API_KEY=AIzaSy...');
  console.log('  3. Re-run: node verify_gemini_connection.js\n');
  process.exit(0);
}

// Mask key for safe console output
const maskedKey = apiKey.length > 8
  ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
  : '****';
console.log(`2. API Key Status: CONFIGURED (${maskedKey})`);

console.log('\n3. Dispatching live API test call to Google Gemini...');

try {
  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({ model: modelName });

  const startTime = Date.now();
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: 'Respond with exactly one sentence confirming you are the ScholarMate-AI Advisor.',
      }],
    }],
    generationConfig: {
      maxOutputTokens: 60,
      temperature: 0.2,
    },
  });

  const duration = Date.now() - startTime;
  const reply = result.response.text().trim();

  console.log(`\n====================================================`);
  console.log(`✅ LIVE GEMINI API TEST SUCCEEDED! (${duration}ms)`);
  console.log(`====================================================`);
  console.log(`Model Response:\n"${reply}"\n`);
  console.log('Live Gemini integration is fully functional.');
} catch (error) {
  console.error('\n====================================================');
  console.error('❌ LIVE GEMINI API TEST FAILED');
  console.error('====================================================');
  console.error('Error Details:', error.message);
  console.error('\nNote: ScholarMate-AI will continue functioning using the deterministic smart fallback generator.');
  process.exit(1);
}
