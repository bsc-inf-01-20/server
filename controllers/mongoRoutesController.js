const { saveBulkRoutes } = require('../services/saveBulkRoutes');

const validateRoute = (route) => {
  if (!route || typeof route !== 'object') return false;
  
  const hasRequiredFields = 
    route.schoolId && 
    route.placeId && 
    typeof route.distance === 'number';
  
  if (!hasRequiredFields) {
    console.warn('Invalid route structure:', route);
  }
  
  return hasRequiredFields;
};

const saveBulkRoutesController = async (req, res) => {
  // Initial validation
  if (!Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request format',
      message: 'Expected an array of route objects',
      example: {
        schoolId: 'string (required)',
        placeId: 'string (required)',
        distance: 'number (required)',
        duration: 'number (optional)',
        // ... other optional fields
      }
    });
  }

  try {
    // Validate all routes
    const validatedRoutes = req.body.filter(validateRoute);

    if (validatedRoutes.length !== req.body.length) {
      console.warn(`Filtered ${req.body.length - validatedRoutes.length} invalid routes`);
    }

    if (validatedRoutes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid routes',
        message: 'All routes were missing required fields',
        requiredFields: ['schoolId', 'placeId', 'distance'],
        received: req.body.length,
        valid: 0
      });
    }

    // Process routes
    const result = await saveBulkRoutes(validatedRoutes);

    return res.status(201).json({
      success: true,
      count: result.count,
      saved: result.routes.length,
      routes: result.routes
    });
  } catch (error) {
    console.error('Bulk save error:', {
      message: error.message,
      status: error.status,
      details: error.details
    });

    const response = {
      success: false,
      error: error.message || 'Failed to save routes',
      details: error.details
    };

    if (process.env.NODE_ENV !== 'production') {
      response.stack = error.stack;
      if (error.failures) {
        response.failures = error.failures.length;
      }
    }

    return res.status(error.status || 500).json(response);
  }
};

module.exports = { saveBulkRoutesController };