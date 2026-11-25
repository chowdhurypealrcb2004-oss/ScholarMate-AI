import express from 'express';
import { matchProfile } from '../controllers/matchController.js';

const router = express.Router();

// POST /api/match
router.post('/', matchProfile);

export default router;
