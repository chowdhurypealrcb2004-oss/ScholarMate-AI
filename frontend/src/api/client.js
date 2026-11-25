/**
 * ScholarMate AI - Unified API Client
 * Interfaces with backend endpoints with instant client-side fallback
 */

import scholarshipsCatalog from '../data/scholarships.json';
import {
  matchStudentScholarshipsClient,
  validateStudentProfile,
} from '../utils/eligibilityMatcher';

const API_BASE_URL = '/api';

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
