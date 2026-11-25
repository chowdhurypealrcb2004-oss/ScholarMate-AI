/**
 * ScholarMate AI - Unified API Client
 * Interfaces with backend endpoints with instant client-side fallback
 */

import scholarshipsCatalog from '../data/scholarships.json';
import {
  matchStudentScholarshipsClient,
  validateStudentProfile,
} from '../utils/eligibilityMatcher';
import {
  evaluateStudentScholarshipsClient,
} from '../utils/eligibilityEvaluator';

const API_BASE_URL = 'https://scholar-mate-ai-cyan.vercel.app/';

export async function fetchScholarships(params = {}) {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });

    const res = await fetch(`${API_BASE_URL}/scholarships?${searchParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[API Client] Backend unavailable, running client-side filtering:', err.message);
  }

  // Client-side fallback
  let list = [...scholarshipsCatalog];
  const { search, category, department, need_based, gender, min_amount, sortBy, sortOrder } = params;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  if (department && department !== 'All') {
    list = list.filter((s) => s.department === 'All' || s.departments.includes(department));
  }

  if (need_based && need_based !== 'All') {
    list = list.filter((s) => s.need_based.toLowerCase() === need_based.toLowerCase());
  }

  if (gender && gender !== 'All') {
    list = list.filter((s) => s.gender === 'All' || s.gender === gender);
  }

  if (min_amount) {
    list = list.filter((s) => s.amount_bdt >= parseFloat(min_amount));
  }

  list.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'deadline') {
      cmp = new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'amount') {
      cmp = a.amount_bdt - b.amount_bdt;
    } else if (sortBy === 'cgpa') {
      cmp = a.min_cgpa - b.min_cgpa;
    } else {
      cmp = a.id - b.id;
    }
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  return {
    success: true,
    total: list.length,
    data: list,
  };
}

export async function fetchScholarshipById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/scholarships/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('[API Client] Backend unavailable, fetching from client catalog');
  }

  const numericId = parseInt(id, 10);
  return scholarshipsCatalog.find((s) => s.id === numericId) || null;
}

export async function postStudentMatch(profile) {
  const validation = validateStudentProfile(profile);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  try {
    const res = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      const result = await res.json();
      return result;
    }
  } catch (err) {
    console.warn('[API Client] Backend unreachable, computing match deterministically client-side:', err.message);
  }

  // Safe client-side execution fallback
  return matchStudentScholarshipsClient(profile, scholarshipsCatalog);
}

/**
 * Module 4: Evaluates student eligibility against scholarship requirements
 * Submits to POST /api/evaluate with client-side fallback
 * @param {Object} profile
 * @returns {Promise<Object>}
 */
export async function evaluateStudentEligibility(profile) {
  try {
    const res = await fetch(`${API_BASE_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[API Client] Backend unreachable for /evaluate, evaluating client-side:', err.message);
  }

  // Robust client-side fallback
  return evaluateStudentScholarshipsClient(profile, scholarshipsCatalog);
}

export async function fetchDatasetStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/scholarships/stats`);
    if (res.ok) {
      const data = await res.json();
      return data.stats;
    }
  } catch (err) {
    console.warn('[API Client] Computing stats client-side');
  }

  const total = scholarshipsCatalog.length;
  const aidPool = scholarshipsCatalog.reduce((sum, s) => sum + s.amount_bdt, 0);
  const avgCgpa = +(scholarshipsCatalog.reduce((sum, s) => sum + s.min_cgpa, 0) / total).toFixed(2);
  const categories = {};
  scholarshipsCatalog.forEach((s) => {
    categories[s.category] = (categories[s.category] || 0) + 1;
  });

  return {
    totalScholarships: total,
    totalAidPool: aidPool,
    averageMinCGPA: avgCgpa,
    categories,
  };
}

/**
 * Module 5: Client-side AI fallback explanation generator
 */
export function generateClientFallbackExplanation(student, scholarship, evaluatedRecord = null) {
  if (!student || !scholarship) return '';
  const isEligible = evaluatedRecord ? evaluatedRecord.status === 'ELIGIBLE' : true;
  const isAlmost = evaluatedRecord ? (evaluatedRecord.status === 'POTENTIALLY_ELIGIBLE' || evaluatedRecord.status === 'ALMOST_ELIGIBLE') : false;

  const studentCgpa = typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : Number(student.cgpa || 0).toFixed(2);
  const minCgpa = (scholarship.min_cgpa || 0).toFixed(2);
  const cgpaMargin = (student.cgpa - scholarship.min_cgpa).toFixed(2);
  const deptStr = scholarship.department === 'All' ? 'any academic discipline' : scholarship.department.replace(/;/g, ', ');

  if (isEligible) {
    let text = `You are a strong match for the ${scholarship.name} offered by ${scholarship.provider}. `;
    if (Number(cgpaMargin) >= 0) {
      text += `Your CGPA of ${studentCgpa} meets the required ${minCgpa} cutoff${Number(cgpaMargin) > 0 ? ` (exceeding it by +${cgpaMargin})` : ''}. `;
    }
    text += `Your department (${student.department}) is eligible under ${deptStr}. `;
    if (scholarship.need_based === 'yes') {
      text += `Your need-based assistance requirement qualifies you for this ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT funding.`;
    } else {
      text += `This merit-based award offers ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT in tuition assistance.`;
    }
    return text;
  }

  if (isAlmost) {
    const missing = evaluatedRecord?.explanation?.missingRequirements ||
                    evaluatedRecord?.breakdown?.missingReasons ||
                    evaluatedRecord?.explanation?.incompleteRequirements || [];
    let text = `You are close to qualifying for the ${scholarship.name} by ${scholarship.provider}. `;
    if (missing.length > 0) {
      text += `Key requirements to review or confirm: ${missing.join('; ')}. `;
    }
    text += `This opportunity provides ৳${Number(scholarship.amount_bdt).toLocaleString('en-US')} BDT before ${scholarship.deadline}.`;
    return text;
  }

  return `Evaluated against ${scholarship.name}: Criteria not met for current academic profile.`;
}

/**
 * Module 5: Fetch AI Advisor service status
 */
export async function fetchAiStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor/status`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API Client] Backend unreachable for AI status, assuming fallback mode:', err.message);
  }

  return {
    success: true,
    service: 'ScholarMate AI Advisor (Client Mode)',
    apiKeyConfigured: false,
    mode: 'fallback_active',
    status: 'healthy',
  };
}

/**
 * Module 5: Request personalized AI explanation for a single scholarship
 */
export async function fetchAiScholarshipExplanation(studentProfile, scholarship, evaluatedRecord = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: studentProfile,
        scholarship,
        evaluatedRecord,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API Client] AI Advisor endpoint error, using client fallback:', err.message);
  }

  return {
    scholarshipId: scholarship.id,
    explanation: generateClientFallbackExplanation(studentProfile, scholarship, evaluatedRecord),
    source: 'fallback',
    isFallback: true,
    model: 'client_fallback_advisor',
  };
}

/**
 * Module 5: Request batch AI explanations for multiple scholarships
 */
export async function fetchAiBatchExplanations(studentProfile, records = []) {
  if (!Array.isArray(records) || records.length === 0) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: studentProfile,
        records,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API Client] Batch AI Advisor error, using client fallback:', err.message);
  }

  return records.map((rec) => {
    const scholarship = rec.scholarship || rec;
    const evaluatedRecord = rec.evaluatedRecord || rec;
    return {
      scholarshipId: scholarship.id,
      explanation: generateClientFallbackExplanation(studentProfile, scholarship, evaluatedRecord),
      source: 'fallback',
      isFallback: true,
      model: 'client_fallback_advisor',
    };
  });
}

/**
 * Module 5: Request executive AI summary for student profile
 */
export async function fetchAiAdvisorSummary(studentProfile, evaluationResults) {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student: studentProfile,
        evaluationResults,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API Client] Executive summary API error, using client fallback:', err.message);
  }

  const eligibleCount = evaluationResults?.summary?.eligibleCount || evaluationResults?.classification?.eligible?.length || 0;
  const potentialCount = evaluationResults?.summary?.potentiallyEligibleCount || evaluationResults?.classification?.potentiallyEligible?.length || 0;
  const totalAid = evaluationResults?.summary?.totalEligibleAid || 0;

  return {
    overview: `Hello ${studentProfile.name || 'Student'}, based on your ${studentProfile.department} profile (CGPA ${studentProfile.cgpa}), our engine matched ${eligibleCount} fully eligible scholarships worth ৳${Number(totalAid).toLocaleString('en-US')} BDT in potential aid. You also have ${potentialCount} opportunities with minor prerequisites to unlock.`,
    topStrengths: [
      studentProfile.cgpa >= 3.5 ? `High academic merit with a CGPA of ${studentProfile.cgpa}` : `Solid academic standing (CGPA ${studentProfile.cgpa})`,
      `Approved eligibility for ${studentProfile.department} departmental awards`,
      studentProfile.needBased ? 'Qualifies for high-impact need-based tuition waivers' : 'Merit-focused award eligibility across universities',
    ],
    recommendedActionPlan: [
      eligibleCount > 0 ? `Prioritize applying for your top ${Math.min(3, eligibleCount)} eligible scholarships.` : 'Review almost-eligible requirements.',
      'Prepare essential documentation (official transcript, recommendation letters).',
      'Track nearest application deadlines to ensure timely submission.',
    ],
    source: 'fallback',
    isFallback: true,
  };
}
