// routes/resepDetailRoutes.js
const express = require('express');
const router = express.Router();
const resepDetailController = require('../controllers/resepDetailController');

// Middleware for protected routes (example)
// const { protect, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/resep-details
 * @desc    Get all resep details with pagination and filtering
 * @access  Public
 */
router.get('/', resepDetailController.getAllResepDetails);

/**
 * @route   GET /api/resep-details/:id
 * @desc    Get resep detail by ID
 * @access  Public
 */
router.get('/:id', resepDetailController.getResepDetailById);

/**
 * @route   GET /api/resep-details/resep/:id_resep
 * @desc    Get all ingredients for a specific recipe
 * @access  Public
 */
router.get('/resep/:id_resep', resepDetailController.getResepDetailsByResepId);

/**
 * @route   POST /api/resep-details
 * @desc    Create a new resep detail (add ingredient to recipe)
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.post('/', protect, resepDetailController.createResepDetail);
router.post('/', resepDetailController.createResepDetail);

/**
 * @route   POST /api/resep-details/batch
 * @desc    Add multiple ingredients to a recipe at once
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.post('/batch', protect, resepDetailController.batchCreateResepDetails);
router.post('/batch', resepDetailController.batchCreateResepDetails);

/**
 * @route   PATCH /api/resep-details/:id
 * @desc    Update resep detail (change quantity or unit)
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.put('/:id', protect, resepDetailController.updateResepDetail);
router.patch('/:id', resepDetailController.updateResepDetail);

/**
 * @route   PUT /api/resep-details/resep/:id_resep/batch
 * @desc    Update multiple ingredients for a recipe at once
 * @access  Protected
 */
// For protected routes, uncomment the middleware:
// router.put('/resep/:id_resep/batch', protect, resepDetailController.batchUpdateResepDetails);
router.put('/resep/:id_resep/batch', resepDetailController.batchUpdateResepDetails);

/**
 * @route   DELETE /api/resep-details/:id
 * @desc    Delete resep detail (remove ingredient from recipe)
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.delete('/:id', protect, resepDetailController.deleteResepDetail);
router.delete('/:id', resepDetailController.deleteResepDetail);

module.exports = router;