// controllers/purchaseOrderController.js
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all purchase orders
exports.getAllPurchaseOrders = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, status, nomor_po, supplier_id, start_date, end_date } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  
  const offset = (page - 1) * limit;
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (nomor_po) {
    const { Op } = require('sequelize');
    where.nomor_po = { [Op.like]: `%${nomor_po}%` };
  }
  
  if (supplier_id) {
    where.supplier_id = supplier_id;
  }
  
  // Date range filter
  const { Op } = require('sequelize');
  if (start_date && end_date) {
    where.tanggal_po = {
      [Op.between]: [start_date, end_date]
    };
  } else if (start_date) {
    where.tanggal_po = {
      [Op.gte]: start_date
    };
  } else if (end_date) {
    where.tanggal_po = {
      [Op.lte]: end_date
    };
  }
  
  const purchaseOrders = await PurchaseOrder.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Supplier,
        as: 'supplier',
        attributes: ['id_supplier', 'nama_supplier']
      }
    ],
    order: [['tanggal_po', 'DESC']]
  });
  
  const totalPages = Math.ceil(purchaseOrders.count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      purchaseOrders: purchaseOrders.rows,
      pagination: {
        total: purchaseOrders.count,
        currentPage: page,
        totalPages,
        limit
      }
    }
  });
});

// Get purchase order by ID
exports.getPurchaseOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id, {
    include: [
      {
        model: Supplier,
        as: 'supplier',
        attributes: ['id_supplier', 'nama_supplier', 'alamat', 'telepon', 'email']
      }
      // Include other related models if needed
    ]
  });
  
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'error',
      message: `Purchase order dengan ID ${id} tidak ditemukan`
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      purchaseOrder
    }
  });
});

// Create new purchase order
exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const { 
    nomor_po, 
    tanggal_po, 
    supplier_id, 
    status, 
    total_harga, 
    tanggal_pengiriman_diharapkan, 
    tanggal_pengiriman_aktual, 
    catatan, 
    dibuat_oleh 
  } = req.body;
  
  // Validate required fields
  if (!nomor_po || !tanggal_po || !supplier_id) {
    return res.status(400).json({
      status: 'error',
      message: "Nomor PO, tanggal PO, dan supplier ID tidak boleh kosong!"
    });
  }
  
  const purchaseOrder = await PurchaseOrder.create({
    nomor_po,
    tanggal_po,
    supplier_id,
    status: status || 'draft',
    total_harga: total_harga || 0.00,
    tanggal_pengiriman_diharapkan,
    tanggal_pengiriman_aktual,
    catatan,
    dibuat_oleh
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Purchase order berhasil dibuat',
    data: {
      purchaseOrder
    }
  });
});

// Update purchase order
exports.updatePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    nomor_po, 
    tanggal_po, 
    supplier_id, 
    status, 
    total_harga, 
    tanggal_pengiriman_diharapkan, 
    tanggal_pengiriman_aktual, 
    catatan, 
    dibuat_oleh 
  } = req.body;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id);
  
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'error',
      message: `Purchase order dengan ID ${id} tidak ditemukan`
    });
  }
  
  // Check if PO can be updated (only if in draft status)
  if (purchaseOrder.status !== 'draft') {
    return res.status(400).json({
      status: 'error',
      message: 'Hanya purchase order dengan status draft yang dapat diubah'
    });
  }
  
  await purchaseOrder.update({
    nomor_po,
    tanggal_po,
    supplier_id,
    status,
    total_harga,
    tanggal_pengiriman_diharapkan,
    tanggal_pengiriman_aktual,
    catatan,
    dibuat_oleh
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Purchase order berhasil diperbarui',
    data: {
      purchaseOrder
    }
  });
});

// Update purchase order status
exports.updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['draft', 'dikirim', 'diterima', 'dibatalkan'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      status: 'error',
      message: "Status tidak valid. Status harus salah satu dari: draft, dikirim, diterima, dibatalkan"
    });
  }
  
  const purchaseOrder = await PurchaseOrder.findByPk(id);
  
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'error',
      message: `Purchase order dengan ID ${id} tidak ditemukan`
    });
  }
  
  // Validate status transitions
  const currentStatus = purchaseOrder.status;
  
  // Rules for status transitions
  if (currentStatus === 'diterima' && status !== 'diterima') {
    return res.status(400).json({
      status: 'error',
      message: 'Purchase order yang sudah diterima tidak dapat diubah statusnya'
    });
  }
  
  if (currentStatus === 'dibatalkan' && status !== 'dibatalkan') {
    return res.status(400).json({
      status: 'error',
      message: 'Purchase order yang sudah dibatalkan tidak dapat diubah statusnya'
    });
  }
  
  await purchaseOrder.update({ status });
  
  res.status(200).json({
    status: 'success',
    message: `Status purchase order berhasil diubah menjadi ${status}`,
    data: {
      purchaseOrder
    }
  });
});

// Cancel purchase order
exports.cancelPurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id);
  
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'error',
      message: `Purchase order dengan ID ${id} tidak ditemukan`
    });
  }
  
  // Check if PO can be cancelled
  if (!['draft', 'dikirim'].includes(purchaseOrder.status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Hanya purchase order dengan status draft atau dikirim yang dapat dibatalkan'
    });
  }
  
  await purchaseOrder.update({ status: 'dibatalkan' });
  
  res.status(200).json({
    status: 'success',
    message: 'Purchase order berhasil dibatalkan',
    data: {
      purchaseOrder
    }
  });
});

// Delete purchase order
exports.deletePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const purchaseOrder = await PurchaseOrder.findByPk(id);
  
  if (!purchaseOrder) {
    return res.status(404).json({
      status: 'error',
      message: `Purchase order dengan ID ${id} tidak ditemukan`
    });
  }
  
  // Only allow deletion of draft or cancelled POs
  if (!['draft', 'dibatalkan'].includes(purchaseOrder.status)) {
    return res.status(400).json({
      status: 'error',
      message: 'Hanya purchase order dengan status draft atau dibatalkan yang dapat dihapus'
    });
  }
  
  await purchaseOrder.destroy();
  
  res.status(200).json({
    status: 'success',
    message: 'Purchase order berhasil dihapus'
  });
});

// Search purchase orders
exports.searchPurchaseOrders = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Parameter pencarian diperlukan'
    });
  }
  
  const { Op } = require('sequelize');
  
  const purchaseOrders = await PurchaseOrder.findAll({
    where: {
      [Op.or]: [
        { nomor_po: { [Op.like]: `%${query}%` } }
      ]
    },
    include: [
      {
        model: Supplier,
        as: 'supplier',
        attributes: ['id_supplier', 'nama_supplier']
      }
    ],
    order: [['tanggal_po', 'DESC']]
  });
  
  res.status(200).json({
    status: 'success',
    results: purchaseOrders.length,
    data: {
      purchaseOrders
    }
  });
});

// Get purchase orders by supplier
exports.getPurchaseOrdersBySupplier = asyncHandler(async (req, res) => {
  const { supplierId } = req.params;
  
  const purchaseOrders = await PurchaseOrder.findAll({
    where: {
      supplier_id: supplierId
    },
    include: [
      {
        model: Supplier,
        as: 'supplier',
        attributes: ['id_supplier', 'nama_supplier']
      }
    ],
    order: [['tanggal_po', 'DESC']]
  });
  
  res.status(200).json({
    status: 'success',
    results: purchaseOrders.length,
    data: {
      purchaseOrders
    }
  });
});