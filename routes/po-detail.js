const express = require('express');
const router = express.Router();


// Get all PO details
router.get('/', async (req, res) => {
  try {
    const poDetails = await PoDetail.findAll({
      include: [
        {
          model: BahanBaku,
          attributes: ['nama', 'satuan', 'harga']
        },
        {
          model: PurchaseOrder,
          attributes: ['nomor', 'tanggal', 'status']
        }
      ]
    });
    
    res.json(poDetails);
  } catch (error) {
    console.error('Error getting PO details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get PO details by purchase order ID
router.get('/purchase-order/:poId', async (req, res) => {
  try {
    const poDetails = await PoDetail.findAll({
      where: { purchaseOrderId: req.params.poId },
      include: [
        {
          model: BahanBaku,
          attributes: ['nama', 'satuan', 'harga']
        }
      ]
    });
    
    res.json(poDetails);
  } catch (error) {
    console.error('Error getting PO details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get PO detail by ID
router.get('/:id', async (req, res) => {
  try {
    const poDetail = await PoDetail.findByPk(req.params.id, {
      include: [
        {
          model: BahanBaku,
          attributes: ['nama', 'satuan', 'harga']
        },
        {
          model: PurchaseOrder,
          attributes: ['nomor', 'tanggal', 'status']
        }
      ]
    });
    
    if (!poDetail) {
      return res.status(404).json({ message: 'PO detail not found' });
    }
    
    res.json(poDetail);
  } catch (error) {
    console.error('Error getting PO detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new PO detail
router.post('/', async (req, res) => {
  try {
    const { purchaseOrderId, bahanBakuId, jumlah, harga, subtotal } = req.body;
    
    const newPoDetail = await PoDetail.create({
      purchaseOrderId,
      bahanBakuId,
      jumlah,
      harga,
      subtotal
    });
    
    const createdDetail = await PoDetail.findByPk(newPoDetail.id, {
      include: [
        {
          model: BahanBaku,
          attributes: ['nama', 'satuan', 'harga']
        },
        {
          model: PurchaseOrder,
          attributes: ['nomor', 'tanggal', 'status']
        }
      ]
    });
    
    res.status(201).json(createdDetail);
  } catch (error) {
    console.error('Error creating PO detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a PO detail
router.put('/:id', async (req, res) => {
  try {
    const { purchaseOrderId, bahanBakuId, jumlah, harga, subtotal } = req.body;
    
    const poDetail = await PoDetail.findByPk(req.params.id);
    
    if (!poDetail) {
      return res.status(404).json({ message: 'PO detail not found' });
    }
    
    await poDetail.update({
      purchaseOrderId,
      bahanBakuId,
      jumlah,
      harga,
      subtotal
    });
    
    const updatedDetail = await PoDetail.findByPk(req.params.id, {
      include: [
        {
          model: BahanBaku,
          attributes: ['nama', 'satuan', 'harga']
        },
        {
          model: PurchaseOrder,
          attributes: ['nomor', 'tanggal', 'status']
        }
      ]
    });
    
    res.json(updatedDetail);
  } catch (error) {
    console.error('Error updating PO detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a PO detail
router.delete('/:id', async (req, res) => {
  try {
    const poDetail = await PoDetail.findByPk(req.params.id);
    
    if (!poDetail) {
      return res.status(404).json({ message: 'PO detail not found' });
    }
    
    await poDetail.destroy();
    
    res.json({ message: 'PO detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting PO detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk create PO details
router.post('/bulk', async (req, res) => {
  try {
    const { details } = req.body;
    
    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: 'Invalid details data' });
    }
    
    const createdDetails = await PoDetail.bulkCreate(details);
    
    res.status(201).json(createdDetails);
  } catch (error) {
    console.error('Error bulk creating PO details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;