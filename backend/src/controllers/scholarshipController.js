import scholarshipService from '../services/csvService.js';

export function getScholarships(req, res) {
  try {
    const {
      search,
      category,
      department,
      need_based,
      gender,
      min_amount,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const parsedMinAmount = min_amount ? parseFloat(min_amount) : 0;
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 0;

    const data = scholarshipService.query({
      search,
      category,
      department,
      need_based,
      gender,
      min_amount: parsedMinAmount,
      sortBy,
      sortOrder,
      page: parsedPage,
      limit: parsedLimit,
    });

    return res.status(200).json({
      success: true,
      total: data.total,
      page: data.page,
      limit: data.limit,
      data: data.scholarships,
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch scholarships',
    });
  }
}

export function getScholarshipById(req, res) {
  try {
    const { id } = req.params;
    const scholarship = scholarshipService.getById(id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: `Scholarship with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    console.error('Error fetching scholarship by ID:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve scholarship',
    });
  }
}

export function getDatasetStats(req, res) {
  try {
    const stats = scholarshipService.getStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching dataset stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to compute dataset statistics',
    });
  }
}
