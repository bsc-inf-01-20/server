const studentRouteService = require('../services/StudentRouteService');
const { validationResult } = require('express-validator');

const saveBulkStudentRoutesController = async (req, res) => {
  // Validate request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed",
      details: errors.array() 
    });
  }

  if (!Array.isArray(req.body)) {
    return res.status(400).json({ 
      error: "Expected an array of student routes",
      received: typeof req.body
    });
  }

  // Basic validation of required fields
  const validatedRoutes = req.body.filter(route => 
    route.studentId && 
    route.schoolId && 
    route.travelMode &&
    typeof route.distance === 'number'
  );

  if (validatedRoutes.length === 0) {
    return res.status(400).json({ 
      error: "No valid student routes provided",
      details: "Each route must have studentId, schoolId, travelMode, and distance"
    });
  }

  try {
    const result = await studentRouteService.createOrUpdateMany(validatedRoutes); // Fixed typo here (validatedRoutes)
    
    if (result.errors.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
        message: "Some student routes failed to process",
        ...result
      });
    }

    return res.status(201).json({
      message: "All student routes processed successfully",
      ...result
    });
  } catch (error) {
    console.error('Bulk student routes save error:', error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  saveBulkStudentRoutesController
};