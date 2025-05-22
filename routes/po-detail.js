// routes/poDetailRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPODetails,
  getPODetailById,
  getPODetailsByPOId,
  createPODetail,
  updatePODetail,
  updatePODetailStatus,
  deletePODetail,
  bulkCreatePODetails,
  getPODetailsSummary
} = require('../controllers/poDetailController');

// Middleware untuk validasi input (optional - bisa ditambahkan sesuai kebutuhan)
// const { validatePODetail } = require('../middleware/validation');

// GET Routes
// Get all PO details with pagination and filters
router.get('/', getAllPODetails);

// Get PO detail by ID
router.get('/:id', getPODetailById);

// Get all details for specific PO
router.get('/po/:poId', getPODetailsByPOId);

// Get PO details summary by status for specific PO
router.get('/po/:poId/summary', getPODetailsSummary);

// POST Routes
// Create single PO detail
router.post('/', createPODetail);

// Bulk create PO details
router.post('/bulk', bulkCreatePODetails);

// PUT Routes
// Update PO detail
router.put('/:id', updatePODetail);

// Update PO detail status (khusus untuk update status dan jumlah_diterima)
router.patch('/:id/status', updatePODetailStatus);

// DELETE Routes
// Delete PO detail
// router.delete('/:id', deletePODetail);

module.exports = router;