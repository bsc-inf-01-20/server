
const express = require('express');
const router = express.Router();
const { apiLimiter, directionsLimiter } = require('../config/rateLimiter');
const placesController = require('../controllers/placesController');
const marketsController = require('../controllers/marketsController');
const directionsController = require('../controllers/directionsController');
const { saveBulkRoutesController } = require('../controllers/mongoRoutesController');

// Apply rate limiting
router.use(apiLimiter);

// Places endpoints
router.get('/places/search', placesController.search);
router.get('/places/malawi-markets', marketsController.search);

// Directions endpoint with stricter rate limiting
router.get('/directions', directionsLimiter, directionsController.getDirections);

// MongoDB routes endpoint
router.post('/routes/bulk', saveBulkRoutesController);

module.exports = router;