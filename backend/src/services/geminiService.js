/**
 * ScholarMate AI - Module 5: Google Gemini AI Advisor Service
 *
 * Responsibilities:
 * 1. Interfaces with Google Gemini API to generate personalized explanations for scholarships.
 * 2. Strict guardrails:
 *    - Never invents scholarship names, providers, amounts, deadlines, or requirements.
 *    - Uses only the student profile and actual scholarship evaluation records provided by Module 4.
 *    - AI does NOT decide eligibility; eligibility is strictly evaluated by Module 4's deterministic logic.
 * 3. Graceful Fallback:
 *    - If GEMINI_API_KEY is missing, expired, rate-limited, or offline, generates high-quality
 *      deterministic personalized explanations with zero downtime.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Initialize Gemini client if key is available and not a placeholder
let genAI = null;
let modelInstance = null;

function isKeyValid(key) {
  return typeof key === 'string' && key.trim().length > 10 && !key.includes('your_gemini_api_key_here');
}

if (isKeyValid(GEMINI_API_KEY)) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY.trim());
    modelInstance = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    console.log(`[ScholarMate-AI Module 5] Google Gemini AI Advisor initialized (Model: ${GEMINI_MODEL})`);
  } catch (err) {
    console.warn(`[ScholarMate-AI Module 5] Failed to initialize Google Generative AI SDK: ${err.message}. Fallback mode active.`);
  }
} else {
  console.log('[ScholarMate-AI Module 5] GEMINI_API_KEY not configured or placeholder detected. Operating in high-reliability deterministic fallback mode.');
}

/**
 * Checks the operational status of the AI Advisor service
 * @returns {Object}
 */
export function getAIStatus() {
  const configured = isKeyValid(process.env.GEMINI_API_KEY);
  return {
    service: 'ScholarMate AI Advisor',
    module: 'Module 5: AI Advisor & Integration',
    apiKeyConfigured: configured,
    model: configured ? GEMINI_MODEL : 'none (deterministic fallback)',
    mode: configured ? 'gemini_active' : 'fallback_active',
    status: 'healthy',
  };
}

/**
 * Generates a high-quality deterministic fallback explanation
 * Used when Gemini API is unavailable, missing, or encounters an error.
 *
 * @param {Object} student - Student profile
 * @param {Object} scholarship - Actual scholarship record
 * @param {Object} evaluatedRecord - Evaluation results from Module 4
 * @returns {string}
 */
export function generateFallbackExplanation(student, scholarship, evaluatedRecord = null) {
  const isEligible = evaluatedRecord ? evaluatedRecord.status === 'ELIGIBLE' : true;
  const isAlmost = evaluatedRecord ? (evaluatedRecord.status === 'POTENTIALLY_ELIGIBLE' || evaluatedRecord.status === 'ALMOST_ELIGIBLE') : false;
  
  const studentCgpa = typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : Number(student.cgpa || 0).toFixed(2);
  const minCgpa = (scholarship.min_cgpa || 0).toFixed(2);
  const cgpaMargin = (student.cgpa - scholarship.min_cgpa).toFixed(2);
  const deptStr = scholarship.department === 'All' ? 'any academic discipline' : scholarship.department.replace(/;/g, ', ');

  if (isEligible) {
    let explanation = `You are a strong match for the ${scholarship.name} offered by ${scholarship.provider}. `;
    
    if (Number(cgpaMargin) >= 0) {
      explanation += `Your current CGPA of ${studentCgpa} meets the required ${minCgpa} minimum cutoff${Number(cgpaMargin) > 0 ? ` (exceeding it by +${cgpaMargin})` : ''}. `;
    }
    
    explanation += `Your department (${student.department}) is eligible under the program's criteria (${deptStr}). `;
    
    if (scholarship.need_based === 'yes') {
      explanation += `Additionally, your need-based assistance requirement aligns with this financial aid program providing ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT.`;
    } else {
      explanation += `This merit-based award offers ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT to support your academic studies.`;
    }

    return explanation;
  }

  if (isAlmost) {
    const missing = evaluatedRecord?.explanation?.missingRequirements || 
                    evaluatedRecord?.breakdown?.missingReasons || 
                    evaluatedRecord?.explanation?.incompleteRequirements || [];
    
    let explanation = `You are close to qualifying for the ${scholarship.name} by ${scholarship.provider}. `;
    
    if (missing.length > 0) {
      explanation += `Key criteria to satisfy or confirm include: ${missing.join('; ')}. `;
    }
    
    explanation += `With an award value of ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT before the ${scholarship.deadline} deadline, fulfilling these requirements will make you a viable applicant.`;
    
    return explanation;
  }

  return `Evaluated against ${scholarship.name}: Student profile (${student.department}, CGPA ${studentCgpa}) does not currently fulfill the minimum eligibility requirements.`;
}

/**
 * System prompt ensuring strict guardrails
 */
const AI_SYSTEM_INSTRUCTION = `You are ScholarMate-AI, an encouraging, accurate, and professional academic scholarship advisor for university students.
Your duty is to generate simple, clear, and personalized explanations for why a student matches an eligible scholarship.

CRITICAL RULES:
1. NEVER invent, hallucinate, or alter scholarship names, providers, amounts, deadlines, or criteria.
2. Use ONLY the provided student profile and actual scholarship data.
3. NEVER determine or change eligibility. The eligibility decision is strictly determined by the deterministic system.
4. Keep the explanation concise (2 to 3 sentences maximum), warm, and easy for a student to understand.
5. Highlight specifically how the student's academic standing (CGPA), department, and financial status align with this scholarship.`;

/**
 * Generates a personalized explanation for an eligible scholarship using Google Gemini API
 * With seamless automatic fallback if the API fails or is unconfigured.
 *
 * @param {Object} student - Student profile
 * @param {Object} scholarship - Actual scholarship record
 * @param {Object} evaluatedRecord - Module 4 evaluated record
 * @returns {Promise<{ explanation: string, source: 'gemini' | 'fallback', isFallback: boolean }>}
 */
export async function generateScholarshipExplanation(student, scholarship, evaluatedRecord = null) {
  // If Gemini is not configured, immediately return deterministic fallback
  if (!modelInstance) {
    return {
      scholarshipId: scholarship.id,
      explanation: generateFallbackExplanation(student, scholarship, evaluatedRecord),
      source: 'fallback',
      isFallback: true,
      model: 'deterministic_advisor',
    };
  }

  try {
    const prompt = `Student Profile:
- Name: ${student.name}
- Department: ${student.department}
- Current CGPA: ${student.cgpa}
- Gender: ${student.gender}
- Financial Need Status: ${student.needBased ? 'Requires financial aid' : 'Merit-focused (No financial aid)'}

Actual Scholarship Record:
- Name: ${scholarship.name}
- Provider: ${scholarship.provider}
- Category: ${scholarship.category || 'Scholarship'}
- Minimum CGPA Required: ${scholarship.min_cgpa}
- Eligible Departments: ${scholarship.department}
- Funding Type: ${scholarship.need_based === 'yes' ? 'Need-based' : 'Merit-based'}
- Award Amount: ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT
- Application Deadline: ${scholarship.deadline}

Eligibility Evaluation Result:
- Status: ${evaluatedRecord?.status || 'ELIGIBLE'}
- Satisfied Criteria: ${evaluatedRecord?.explanation?.satisfiedConditions?.join(', ') || 'Met CGPA and Department requirements'}

Task: Write a short, personalized explanation (2-3 clear sentences) for ${student.name} explaining why they match this scholarship. Be encouraging and clear.`;

    // Set timeout of 8 seconds to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timed out')), 8000)
    );

    const apiPromise = modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${AI_SYSTEM_INSTRUCTION}\n\n${prompt}` }] }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3, // Low temperature for high factual accuracy
      },
    });

    const result = await Promise.race([apiPromise, timeoutPromise]);
    const responseText = result.response.text().trim();

    if (responseText && responseText.length > 20) {
      return {
        scholarshipId: scholarship.id,
        explanation: responseText,
        source: 'gemini',
        isFallback: false,
        model: GEMINI_MODEL,
      };
    }

    throw new Error('Empty response from Gemini API');
  } catch (err) {
    console.warn(`[ScholarMate-AI Gemini Service] API call failed for scholarship ${scholarship.id} (${err.message}). Using fallback.`);
    return {
      scholarshipId: scholarship.id,
      explanation: generateFallbackExplanation(student, scholarship, evaluatedRecord),
      source: 'fallback',
      isFallback: true,
      error: err.message,
      model: 'deterministic_advisor',
    };
  }
}

/**
 * Generates batch explanations for a list of scholarships
 * Optimizes performance by using structured prompts or graceful fallbacks.
 *
 * @param {Object} student
 * @param {Array<Object>} records - Array of { scholarship, evaluatedRecord }
 * @returns {Promise<Array<Object>>}
 */
export async function generateBatchScholarshipExplanations(student, records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  // If Gemini is not configured, generate fallback for all records instantly
  if (!modelInstance) {
    return records.map((rec) => {
      const scholarship = rec.scholarship || rec;
      const evaluatedRecord = rec.evaluatedRecord || rec;
      return {
        scholarshipId: scholarship.id,
        explanation: generateFallbackExplanation(student, scholarship, evaluatedRecord),
        source: 'fallback',
        isFallback: true,
        model: 'deterministic_advisor',
      };
    });
  }

  // To maintain fast response times and avoid rate limits, generate for up to 6 priority scholarships via Gemini,
  // and use instant deterministic fallback for the rest
  const priorityCount = Math.min(6, records.length);
  const priorityRecords = records.slice(0, priorityCount);
  const remainingRecords = records.slice(priorityCount);

  const priorityPromises = priorityRecords.map((rec) => {
    const scholarship = rec.scholarship || rec;
    const evaluatedRecord = rec.evaluatedRecord || rec;
    return generateScholarshipExplanation(student, scholarship, evaluatedRecord);
  });

  const priorityResults = await Promise.all(priorityPromises);

  const remainingResults = remainingRecords.map((rec) => {
    const scholarship = rec.scholarship || rec;
    const evaluatedRecord = rec.evaluatedRecord || rec;
    return {
      scholarshipId: scholarship.id,
      explanation: generateFallbackExplanation(student, scholarship, evaluatedRecord),
      source: 'fallback',
      isFallback: true,
      model: 'deterministic_advisor',
    };
  });

  return [...priorityResults, ...remainingResults];
}

/**
 * Generates an overall AI Advisor executive summary for the student's profile & results
 *
 * @param {Object} student
 * @param {Object} evaluationResults
 * @returns {Promise<Object>}
 */
export async function generateAdvisorExecutiveSummary(student, evaluationResults) {
  const eligibleCount = evaluationResults?.summary?.eligibleCount || evaluationResults?.classification?.eligible?.length || 0;
  const potentialCount = evaluationResults?.summary?.potentiallyEligibleCount || evaluationResults?.classification?.potentiallyEligible?.length || 0;
  const totalAid = evaluationResults?.summary?.totalEligibleAid || 0;

  const fallbackSummary = {
    overview: `Hello ${student.name || 'Student'}, based on your academic profile (${student.department}, CGPA ${student.cgpa}), our engine identified ${eligibleCount} fully eligible scholarships with a total potential aid pool of ৳${Number(totalAid).toLocaleString('en-US')} BDT. You also have ${potentialCount} opportunities where satisfying minor prerequisites can unlock further funding.`,
    topStrengths: [
      student.cgpa >= 3.5 ? `Outstanding academic merit with a CGPA of ${student.cgpa}` : `Competitive academic standing (CGPA ${student.cgpa})`,
      `Full qualification for ${student.department} department scholarship allocations`,
      student.needBased ? 'Eligibility for high-impact need-based tuition waivers' : 'Merit-based award eligibility across top foundations',
    ],
    recommendedActionPlan: [
      eligibleCount > 0 ? `Prioritize applications for your top ${Math.min(3, eligibleCount)} fully eligible awards immediately.` : 'Review almost-eligible requirements to expand your match pool.',
      'Prepare essential documentation: official transcript, recommendation letter, and statement of purpose.',
      'Check upcoming deadlines to ensure early submission before dates close.',
    ],
    source: 'fallback',
    isFallback: true,
  };

  if (!modelInstance) {
    return fallbackSummary;
  }

  try {
    const prompt = `Student: ${student.name}, Dept: ${student.department}, CGPA: ${student.cgpa}, Need: ${student.needBased ? 'Yes' : 'No'}.
Results: ${eligibleCount} fully eligible awards (Total ৳${Number(totalAid).toLocaleString('en-US')} BDT), ${potentialCount} almost-eligible awards.
Write a 2-sentence encouraging executive greeting and assessment for this student. Return plain text only.`;

    const apiPromise = modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${AI_SYSTEM_INSTRUCTION}\n\n${prompt}` }] }],
      generationConfig: { maxOutputTokens: 150, temperature: 0.3 },
    });

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 6000));
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const text = result.response.text().trim();

    if (text && text.length > 20) {
      return {
        ...fallbackSummary,
        overview: text,
        source: 'gemini',
        isFallback: false,
        model: GEMINI_MODEL,
      };
    }

    return fallbackSummary;
  } catch (err) {
    console.warn(`[ScholarMate-AI Gemini Service] Executive summary API failed: ${err.message}. Using fallback.`);
    return fallbackSummary;
  }
}

export default {
  getAIStatus,
  generateFallbackExplanation,
  generateScholarshipExplanation,
  generateBatchScholarshipExplanations,
  generateAdvisorExecutiveSummary,
};
