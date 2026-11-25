import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV } from '../utils/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ScholarshipDataService {
  constructor() {
    this.scholarships = [];
    this.isLoaded = false;
    this.datasetPath = this.resolveDatasetPath();
  }

  resolveDatasetPath() {
    if (process.env.DATASET_PATH) {
      const customPath = path.resolve(process.cwd(), process.env.DATASET_PATH);
      if (fs.existsSync(customPath)) return customPath;
    }

    const possiblePaths = [
      path.resolve(__dirname, '../../../data/scholarships.csv'),
      path.resolve(__dirname, '../../data/scholarships.csv'),
      path.resolve(process.cwd(), 'data/scholarships.csv'),
      path.resolve(process.cwd(), '../data/scholarships.csv'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return path.resolve(__dirname, '../../../data/scholarships.csv');
  }

  loadDataset() {
    if (this.isLoaded && this.scholarships.length > 0) {
      return this.scholarships;
    }

    if (!fs.existsSync(this.datasetPath)) {
      throw new Error(`Official scholarship dataset could not be located at: ${this.datasetPath}`);
    }

    const csvContent = fs.readFileSync(this.datasetPath, 'utf8');
    const records = parseCSV(csvContent);

    if (!records || records.length === 0) {
      throw new Error(`Failed to parse scholarship dataset or dataset is empty at: ${this.datasetPath}`);
    }

    this.scholarships = records;
    this.isLoaded = true;

    // Synchronize to structured JSON for fast consumption and offline client support
    try {
      const jsonOutputPath = path.resolve(path.dirname(this.datasetPath), 'scholarships.json');
      fs.writeFileSync(jsonOutputPath, JSON.stringify(this.scholarships, null, 2), 'utf8');

      // Also ensure frontend/src/data has access if directory exists
      const frontendDataDir = path.resolve(this.datasetPath, '../../frontend/src/data');
      if (!fs.existsSync(frontendDataDir)) {
        fs.mkdirSync(frontendDataDir, { recursive: true });
      }
      fs.writeFileSync(path.join(frontendDataDir, 'scholarships.json'), JSON.stringify(this.scholarships, null, 2), 'utf8');
    } catch (err) {
      console.warn('Notice: Could not write mirrored scholarships.json:', err.message);
    }

    return this.scholarships;
  }

  getAll() {
    return this.loadDataset();
  }

  getById(id) {
    const numericId = parseInt(id, 10);
    const list = this.loadDataset();
    return list.find((item) => item.id === numericId) || null;
  }

  query({
    search = '',
    category = '',
    department = '',
    need_based = '',
    gender = '',
    min_amount = 0,
    sortBy = 'deadline',
    sortOrder = 'asc',
    page = 1,
    limit = 0,
  } = {}) {
    let results = [...this.loadDataset()];

    // Search filter
    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.provider.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      results = results.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    // Department filter
    if (department && department !== 'All') {
      results = results.filter(
        (s) => s.department === 'All' || s.departments.includes(department)
      );
    }

    // Need based filter
    if (need_based && need_based !== 'All') {
      results = results.filter((s) => s.need_based.toLowerCase() === need_based.toLowerCase());
    }

    // Gender filter
    if (gender && gender !== 'All') {
      results = results.filter((s) => s.gender === 'All' || s.gender === gender);
    }

    // Min Amount
    if (min_amount > 0) {
      results = results.filter((s) => s.amount_bdt >= min_amount);
    }

    // Sorting
    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline) - new Date(b.deadline);
          break;
        case 'amount':
        case 'amount_bdt':
          comparison = a.amount_bdt - b.amount_bdt;
          break;
        case 'cgpa':
        case 'min_cgpa':
          comparison = a.min_cgpa - b.min_cgpa;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = a.id - b.id;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = results.length;

    // Pagination if limit > 0
    if (limit > 0) {
      const offset = (Math.max(1, page) - 1) * limit;
      results = results.slice(offset, offset + limit);
    }

    return {
      total: totalCount,
      page: limit > 0 ? page : 1,
      limit: limit > 0 ? limit : totalCount,
      scholarships: results,
    };
  }

  getStats() {
    const list = this.loadDataset();
    const totalCount = list.length;
    let totalAidPool = 0;
    let totalCGPA = 0;
    const categoryCounts = {};
    const deptCounts = {};
    let needBasedCount = 0;
    let femaleOnlyCount = 0;

    for (const item of list) {
      totalAidPool += item.amount_bdt || 0;
      totalCGPA += item.min_cgpa || 0;

      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

      if (item.department === 'All') {
        deptCounts['All'] = (deptCounts['All'] || 0) + 1;
      } else {
        item.departments.forEach((d) => {
          deptCounts[d] = (deptCounts[d] || 0) + 1;
        });
      }

      if (item.need_based === 'yes') needBasedCount++;
      if (item.gender === 'Female') femaleOnlyCount++;
    }

    return {
      totalScholarships: totalCount,
      totalAidPool,
      averageMinCGPA: totalCount > 0 ? +(totalCGPA / totalCount).toFixed(2) : 0,
      needBasedCount,
      meritBasedCount: totalCount - needBasedCount,
      femaleSpecificCount: femaleOnlyCount,
      categories: categoryCounts,
      departments: deptCounts,
    };
  }
}

export const scholarshipService = new ScholarshipDataService();
export default scholarshipService;
