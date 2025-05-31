const express = require('express');
const router = express.Router();
const { apiLimiter, directionsLimiter } = require('../config/rateLimiter');
const placesController = require('../controllers/placesController');
const marketsController = require('../controllers/marketsController');
const directionsController = require('../controllers/directionsController');
const { saveBulkRoutesController } = require('../controllers/mongoRoutesController');
const { saveBulkStudentRoutesController } = require('../controllers/saveBulkStudentRoutesController');
const { body } = require('express-validator');

// Student routes validation middleware
const validateStudentRoutes = [
  body('*.studentId').isString().notEmpty(),
  body('*.schoolId').isString().notEmpty(),
  body('*.travelMode').isString().isIn(['walking', 'driving', 'bicycling', 'transit']),
  body('*.distance').isFloat({ min: 0 }),
  body('*.duration').optional().isInt({ min: 0 }),
  body('*.coordinates').optional().isObject(),
  body('*.academicYear').optional().isString(),
  body('*.division').optional().isString(),
  body('*.district').optional().isString(),
  body('*.zone').optional().isString()
];

// Apply rate limiting
router.use(apiLimiter);

// Places endpoints
router.get('/places/search', placesController.search);
router.get('/places/malawi-markets', marketsController.search);

// Directions endpoint with stricter rate limiting
router.get('/directions', directionsLimiter, directionsController.getDirections);

// Routes endpoints
router.post('/routes/bulk', saveBulkRoutesController); // Existing route
router.post('/student-routes/bulk', validateStudentRoutes, saveBulkStudentRoutesController); // New student routes endpoint

module.exports = router;