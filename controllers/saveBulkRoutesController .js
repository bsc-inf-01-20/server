const { saveBulkRoutes } = require('../services/saveBulkRoutes');

const saveBulkRoutesController = async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ 
      error: "Expected an array of routes",
      received: typeof req.body
    });
  }

  // Validate each route has required fields
  const validatedRoutes = req.body.filter(route => 
    route.schoolId && 
    route.placeId && 
    typeof route.distance === 'number'
  );

  if (validatedRoutes.length === 0) {
    return res.status(400).json({ 
      error: "No valid routes provided",
      details: "Each route must have schoolId, placeId, and distance"
    });
  }

  try {
    const savedRoutes = await saveBulkRoutes(validatedRoutes);
    res.status(201).json(savedRoutes);
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(error.status || 500).json({ 
      error: error.message || 'Database operation failed',
      failures: error.failures || [],
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  saveBulkRoutesController
};