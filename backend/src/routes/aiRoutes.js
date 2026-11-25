/**
 * ScholarMate AI - Module 5: AI Advisor Routes
 */

import express from 'express';
import {
  getStatus,
  explainScholarship,
  explainExecutiveSummary,
} from '../controllers/aiController.js';

const router = express.Router();

// GET /api/ai-advisor/status
router.get('/status', getStatus);

// POST /api/ai-advisor/explain
router.post('/explain', explainScholarship);

// POST /api/ai-advisor/summary
router.post('/summary', explainExecutiveSummary);

export default router;
