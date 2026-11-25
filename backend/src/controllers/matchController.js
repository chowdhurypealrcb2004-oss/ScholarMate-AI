import { matchStudentScholarships, validateStudentProfile } from '../services/eligibilityService.js';

export function matchProfile(req, res) {
  try {
    const studentProfile = req.body;

    const validation = validateStudentProfile(studentProfile);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Student profile validation failed',
        errors: validation.errors,
      });
    }

    const matchResults = matchStudentScholarships(studentProfile);

    return res.status(200).json({
      success: true,
      ...matchResults,
    });
  } catch (error) {
    console.error('Error during scholarship matching:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Scholarship matching evaluation failed',
      errors: error.errors || [],
    });
  }
}
