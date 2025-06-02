const teacherRouteService = require('../services/TeacherRouteService');
const { validationResult } = require('express-validator');

const saveBulkTeacherRoutesController = async (req, res) => {
  // Validate request using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }

  if (!Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      error: "Invalid request format",
      details: "Expected an array of teacher routes",
      received: typeof req.body,
      timestamp: new Date().toISOString()
    });
  }

  // Additional content validation
  const validationErrors = [];
  const validatedRoutes = req.body.filter((route, index) => {
    if (!route.teacherId || !route.schoolId) {
      validationErrors.push({
        index,
        error: "Missing required fields",
        required: ["teacherId", "schoolId"],
        received: {
          teacherId: route.teacherId,
          schoolId: route.schoolId
        }
      });
      return false;
    }
    return true;
  });

  if (validatedRoutes.length === 0 && validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "All routes failed validation",
      details: validationErrors,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const startTime = process.hrtime();
    const result = await teacherRouteService.createOrUpdateMany(validatedRoutes);
    const elapsedTime = process.hrtime(startTime);
    
    const response = {
      success: result.errors.length === 0,
      stats: {
        totalReceived: req.body.length,
        totalProcessed: validatedRoutes.length,
        created: result.createdCount,
        updated: result.updatedCount,
        skipped: result.skippedCount,
        processingTime: `${(elapsedTime[0] * 1000 + elapsedTime[1] / 1000000).toFixed(2)}ms`
      },
      timestamp: new Date().toISOString()
    };

    if (result.errors.length > 0) {
      response.errors = result.errors;
      return res.status(207).json(response); // 207 Multi-Status
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error('Bulk teacher routes processing error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  saveBulkTeacherRoutesController
};