// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Middleware for protected routes (example)
// const { protect, restrictTo } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers with pagination, filtering, and search
 * @access  Public
 */
router.get('/', supplierController.getAllSuppliers);

/**
 * @route   GET /api/suppliers/search
 * @desc    Search suppliers by name, contact person, or email
 * @access  Public
 */
router.get('/search', supplierController.searchSuppliers);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Public
 */
router.get('/:id', supplierController.getSupplierById);

/**
 * @route   POST /api/suppliers
 * @desc    Create a new supplier
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.post('/', protect, supplierController.createSupplier);
router.post('/', supplierController.createSupplier);

/**
 * @route   PUT /api/suppliers/:id
 * @desc    Update supplier
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.put('/:id', protect, supplierController.updateSupplier);
router.put('/:id', supplierController.updateSupplier);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Soft delete supplier (update status to 'tidak_aktif')
 * @access  Protected
 */
// For protected routes, uncomment the middleware: router.delete('/:id', protect, supplierController.deleteSupplier);
router.delete('/:id', supplierController.deleteSupplier);

/**
 * @route   DELETE /api/suppliers/:id/permanent
 * @desc    Permanently delete supplier
 * @access  Admin
 */
// For protected routes with role restrictions, uncomment:
// router.delete('/:id/permanent', protect, restrictTo('admin'), supplierController.permanentDeleteSupplier);
router.delete('/:id/permanent', supplierController.permanentDeleteSupplier);

module.exports = router;