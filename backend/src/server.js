import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import scholarshipService from './services/csvService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    module: 'Module 3: Scholarship Data & Matching',
    recordsLoaded: scholarshipService.scholarships.length,
    timestamp: new Date().toISOString(),
  });
});

// Module 3 & Module 4 Routes
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/evaluate', evaluationRoutes);

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
