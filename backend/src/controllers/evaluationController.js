import { evaluateStudentScholarships, inspectStudentProfile } from '../services/evaluationService.js';

/**
 * Controller for Module 4 Eligibility Evaluation
 * Endpoint: POST /api/evaluate
 */
export function evaluateProfile(req, res) {
  try {
    const studentProfile = req.body;

    const inspected = inspectStudentProfile(studentProfile);
    if (!inspected.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Student profile validation failed',
        errors: inspected.errors,
        missingFields: inspected.missingFields,
      });
    }

    const evaluationResults = evaluateStudentScholarships(studentProfile);

    return res.status(200).json({
      success: true,
      module: 'Module 4: Eligibility Evaluation',
      ...evaluationResults,
    });
  } catch (error) {
    console.error('Error during eligibility evaluation:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Eligibility evaluation failed',
      errors: error.errors || [],
    });
  }
}
