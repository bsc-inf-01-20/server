const express = require('express');
const router = express.Router();
const { apiLimiter, directionsLimiter } = require('../config/rateLimiter');
const placesController = require('../controllers/placesController');
const marketsController = require('../controllers/marketsController');
const directionsController = require('../controllers/directionsController');
const { saveBulkRoutesController } = require('../controllers/mongoRoutesController');
const { saveBulkStudentRoutesController } = require('../controllers/saveBulkStudentRoutesController');
const { saveBulkTeacherRoutesController } = require('../controllers/saveBulkTeacherRoutesController');
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

// Teacher routes validation middleware
const validateTeacherRoutes = [
  body('*.teacherId').isString().notEmpty(),
  body('*.schoolId').isString().notEmpty(),
  body('*.travelMode').isString().isIn(['walking', 'driving', 'bicycling', 'transit']),
  body('*.distance').isFloat({ min: 0 }),
  body('*.duration').optional().isInt({ min: 0 }),
  body('*.coordinates').optional().isObject(),
  body('*.academicYear').optional().isString(),
  body('*.division').optional().isString(),
  body('*.district').optional().isString(),
  body('*.zone').optional().isString(),
  body('*.teacherCode').optional().isString(),
  body('*.specialization').optional().isString()
];

// Apply general rate limiting
router.use(apiLimiter);

/**
 * @swagger
 * tags:
 *   - name: Places
 *   - name: Markets
 *   - name: Directions
 *   - name: Routes
 *   - name: StudentRoutes
 *   - name: TeacherRoutes
 */

/**
 * @swagger
 * /places/search:
 *   get:
 *     summary: Search for places using a keyword
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term or keyword
 *     responses:
 *       200:
 *         description: List of matching places
 */
router.get('/places/search', placesController.search);

/**
 * @swagger
 * /places/malawi-markets:
 *   get:
 *     summary: Get markets in Malawi
 *     tags: [Markets]
 *     responses:
 *       200:
 *         description: A list of Malawi markets
 */
router.get('/places/malawi-markets', marketsController.search);

/**
 * @swagger
 * /directions:
 *   get:
 *     summary: Get directions between two points
 *     tags: [Directions]
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         required: true
 *         description: Origin in "lat,lng" format
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         required: true
 *         description: Destination in "lat,lng" format
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [walking, driving, bicycling, transit]
 *         description: Travel mode
 *     responses:
 *       200:
 *         description: Direction data
 */
router.get('/directions', directionsLimiter, directionsController.getDirections);

/**
 * @swagger
 * /routes/bulk:
 *   post:
 *     summary: Save bulk route data to MongoDB
 *     tags: [Routes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 schoolId:
 *                   type: string
 *                 placeId:
 *                   type: string
 *                 travelMode:
 *                   type: string
 *                 distance:
 *                   type: number
 *                 duration:
 *                   type: number
 *                 coordinates:
 *                   type: object
 *     responses:
 *       200:
 *         description: Bulk routes saved successfully
 */
router.post('/routes/bulk', saveBulkRoutesController);

/**
 * @swagger
 * /student-routes/bulk:
 *   post:
 *     summary: Save bulk student-to-school routes
 *     tags: [StudentRoutes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 studentId:
 *                   type: string
 *                 schoolId:
 *                   type: string
 *                 travelMode:
 *                   type: string
 *                   enum: [walking, driving, bicycling, transit]
 *                 distance:
 *                   type: number
 *                 duration:
 *                   type: number
 *                 coordinates:
 *                   type: object
 *                 academicYear:
 *                   type: string
 *                 division:
 *                   type: string
 *                 district:
 *                   type: string
 *                 zone:
 *                   type: string
 *     responses:
 *       200:
 *         description: Student routes saved successfully
 */
router.post('/student-routes/bulk', validateStudentRoutes, saveBulkStudentRoutesController);

/**
 * @swagger
 * /teacher-routes/bulk:
 *   post:
 *     summary: Save bulk teacher-to-school routes
 *     tags: [TeacherRoutes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 teacherId:
 *                   type: string
 *                 teacherName:
 *                   type: string
 *                 teacherCode:
 *                   type: string
 *                 specialization:
 *                   type: string
 *                 schoolId:
 *                   type: string
 *                 schoolName:
 *                   type: string
 *                 travelMode:
 *                   type: string
 *                   enum: [walking, driving, bicycling, transit]
 *                 distance:
 *                   type: number
 *                 duration:
 *                   type: number
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: array
 *                       items:
 *                         type: number
 *                     school:
 *                       type: array
 *                       items:
 *                         type: number
 *                 academicYear:
 *                   type: string
 *                 division:
 *                   type: string
 *                 district:
 *                   type: string
 *                 zone:
 *                   type: string
 *                 polyline:
 *                   type: string
 *     responses:
 *       201:
 *         description: Teacher routes saved successfully
 *       207:
 *         description: Some teacher routes failed to process
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/teacher-routes/bulk', validateTeacherRoutes, saveBulkTeacherRoutesController);

module.exports = router;