// routes/purchaseOrderRoutes.js
const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Get all purchase orders with filters and pagination
router.get('/', purchaseOrderController.getAllPurchaseOrders);

// Search purchase orders
router.get('/search', purchaseOrderController.searchPurchaseOrders);

// Get purchase orders by supplier ID
router.get('/supplier/:supplierId', purchaseOrderController.getPurchaseOrdersBySupplier);

// Get a single purchase order by ID
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

// Create a new purchase order
router.post('/', purchaseOrderController.createPurchaseOrder);

// Update a purchase order
router.put('/:id', purchaseOrderController.updatePurchaseOrder);

// Update purchase order status
router.patch('/:id/status', purchaseOrderController.updatePurchaseOrderStatus);

// Cancel a purchase order
router.patch('/:id/cancel', purchaseOrderController.cancelPurchaseOrder);

// Delete a purchase order
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

module.exports = router;