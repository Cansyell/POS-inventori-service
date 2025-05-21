const express = require('express');
const router = express.Router();
const bahanBakuController = require('../controllers/bahanBakuController');

// Protected routes
// Semua route di bawah ini memerlukan autentikasi

// Endpoint bahan baku
router.post('/', bahanBakuController.createBahanBaku);
router.get('/', bahanBakuController.getAllBahanBaku);
router.get('/low-stock', bahanBakuController.getLowStock);
router.get('/:id', bahanBakuController.getBahanBakuById);
router.put('/:id', bahanBakuController.updateBahanBaku); // Update data bahan baku
router.patch('/:id/status', bahanBakuController.updateBahanBakuStatus); // Update status bahan baku
router.patch('/:id/stock', bahanBakuController.updateStock); // Update stok bahan baku
router.delete('/:id', bahanBakuController.deleteBahanBaku); // Hapus bahan baku


module.exports = router;