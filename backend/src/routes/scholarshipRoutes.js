import express from 'express';
import {
  getScholarships,
  getScholarshipById,
  getDatasetStats,
} from '../controllers/scholarshipController.js';

const router = express.Router();

// GET /api/scholarships/stats
router.get('/stats', getDatasetStats);

// GET /api/scholarships/:id
router.get('/:id', getScholarshipById);

// GET /api/scholarships
router.get('/', getScholarships);

export default router;
