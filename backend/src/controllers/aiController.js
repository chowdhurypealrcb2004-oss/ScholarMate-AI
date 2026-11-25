/**
 * ScholarMate AI - Module 5: AI Advisor Controller
 *
 * Handles HTTP requests for AI explanations, batch explanations, and executive summaries.
 */

import {
  getAIStatus,
  generateScholarshipExplanation,
  generateBatchScholarshipExplanations,
  generateAdvisorExecutiveSummary,
} from '../services/geminiService.js';
import { validateStudentProfile } from '../services/eligibilityService.js';

/**
 * GET /api/ai-advisor/status
 */
export function getStatus(req, res) {
  try {
    const status = getAIStatus();
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI Advisor status',
      error: error.message,
    });
  }
}

/**
 * POST /api/ai-advisor/explain
 * Accepts either:
 * 1. Single: { student, scholarship, evaluatedRecord }
 * 2. Batch: { student, records: [{ scholarship, evaluatedRecord }, ...] }
 */
export async function explainScholarship(req, res) {
  try {
    const { student, scholarship, evaluatedRecord, records } = req.body;

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student profile is required for AI explanations.',
      });
    }

    // Handle batch request
    if (Array.isArray(records) && records.length > 0) {
      const batchExplanations = await generateBatchScholarshipExplanations(student, records);
      return res.status(200).json({
        success: true,
        module: 'Module 5: AI Advisor & Integration',
        data: batchExplanations,
      });
    }

    // Handle single request
    if (!scholarship) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship data is required when requesting a single explanation.',
      });
    }

    const explanationResult = await generateScholarshipExplanation(student, scholarship, evaluatedRecord);

    return res.status(200).json({
      success: true,
      module: 'Module 5: AI Advisor & Integration',
      data: explanationResult,
    });
  } catch (error) {
    console.error('[AI Advisor Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI scholarship explanation',
      error: error.message,
    });
  }
}

/**
 * POST /api/ai-advisor/summary
 * Accepts: { student, evaluationResults }
 */
export async function explainExecutiveSummary(req, res) {
  try {
    const { student, evaluationResults } = req.body;

    if (!student || !evaluationResults) {
      return res.status(400).json({
        success: false,
        message: 'Both student profile and evaluation results are required.',
      });
    }

    const summaryResult = await generateAdvisorExecutiveSummary(student, evaluationResults);

    return res.status(200).json({
      success: true,
      module: 'Module 5: AI Advisor & Integration',
      data: summaryResult,
    });
  } catch (error) {
    console.error('[AI Advisor Controller Summary Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI executive summary',
      error: error.message,
    });
  }
}

export default {
  getStatus,
  explainScholarship,
  explainExecutiveSummary,
};
