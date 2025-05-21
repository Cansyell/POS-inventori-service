const express = require('express');
const router = express.Router();
const resepController = require('../controllers/resepController');

// Protected routes
// Semua route di bawah ini memerlukan autentikasi

// Endpoint resep
router.post('/', resepController.createResep);
router.get('/', resepController.getAllResep);
router.get('/kategori', resepController.getKategori);
router.get('/search', resepController.searchResep);
router.get('/:id', resepController.getResepById);
router.put('/:id', resepController.updateResep); // Update data resep
router.patch('/:id/status', resepController.updateResepStatus); // Update status resep
router.delete('/:id', resepController.deleteResep); // Hapus resep

// Endpoint untuk cek ketersediaan nama resep
router.post('/check-availability', resepController.checkAvailability);

module.exports = router;