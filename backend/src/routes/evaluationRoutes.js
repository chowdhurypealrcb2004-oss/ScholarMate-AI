import express from 'express';
import { evaluateProfile } from '../controllers/evaluationController.js';

const router = express.Router();

// POST /api/evaluate
router.post('/', evaluateProfile);

export default router;
