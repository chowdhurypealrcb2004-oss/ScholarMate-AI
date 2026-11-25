import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import scholarshipService from './services/csvService.js';
import { getAIStatus } from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Warm up dataset on startup
try {
  const records = scholarshipService.loadDataset();
  console.log(`[ScholarMate-AI] Successfully ingested official dataset: ${records.length} records.`);
} catch (err) {
  console.error('[ScholarMate-AI] Critical error loading dataset:', err.message);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    modules: {
      module1: 'Module 1: Frontend & Landing (Active)',
      module2: 'Module 2: Student Profile Form (Active)',
      module3: 'Module 3: Scholarship Data & Matching (Active)',
      module4: 'Module 4: Eligibility Evaluation (Active)',
      module5: 'Module 5: AI Advisor & Integration (Active)',
    },
    aiStatus: getAIStatus(),
    recordsLoaded: scholarshipService.scholarships.length,
    timestamp: new Date().toISOString(),
  });
});

// Module 3, Module 4 & Module 5 Routes
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/evaluate', evaluationRoutes);
app.use('/api/ai-advisor', aiRoutes);
app.use('/api/ai', aiRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[ScholarMate-AI Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server only when directly run
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ScholarMate-AI Server] Listening on http://localhost:${PORT}`);
  });
}

export default app;
