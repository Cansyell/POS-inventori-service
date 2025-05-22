const PoDetail = require('../models/PoDetail'); // Sesuaikan dengan nama file yang ada
const PurchaseOrder = require('../models/PurchaseOrder');
const BahanBaku = require('../models/BahanBaku');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all PO details
exports.getAllPODetails = asyncHandler(async (req, res) => {
  try {
    let { page = 1, limit = 10, id_po, status, id_bahan_baku } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (id_po) {
      where.id_po = id_po;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (id_bahan_baku) {
      where.id_bahan_baku = id_bahan_baku;
    }

    console.log('Querying po_detail with where:', where);
    
    const poDetails = await PoDetail.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id_po', 'nomor_po', 'tanggal_po', 'status'],
          required: false
        },
        {
          model: BahanBaku,
          as: 'bahanBaku', // Sesuai dengan associations yang ada
          attributes: ['id_bahan_baku', 'nama_bahan', 'satuan', 'harga_per_satuan'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const totalPages = Math.ceil(poDetails.count / limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        poDetails: poDetails.rows,
        pagination: {
          total: poDetails.count,
          currentPage: page,
          totalPages,
          limit
        }
      }
    });
    
  } catch (error) {
    console.error('Error in getAllPODetails:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data PO Detail',
      error: error.message
    });
  }
});

// Get PO detail by ID - DIPERBAIKI
exports.getPODetailById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi parameter ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID tidak valid'
      });
    }
    
    console.log('Finding PO Detail with ID:', id);
    
    const poDetail = await PoDetail.findByPk(id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id_po', 'nomor_po', 'tanggal_po', 'status'],
          required: false
        },
        {
          model: BahanBaku,
          as: 'bahanBaku',
          attributes: ['id_bahan_baku', 'nama_bahan', 'satuan', 'harga_per_satuan', 'keterangan'],
          required: false
        }
      ]
    });
    
    if (!poDetail) {
      return res.status(404).json({
        status: 'error',
        message: `PO Detail dengan ID ${id} tidak ditemukan`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        poDetail
      }
    });
    
  } catch (error) {
    console.error('Error in getPODetailById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data PO Detail',
      error: error.message
    });
  }
});

// Get PO details by PO ID
exports.getPODetailsByPOId = asyncHandler(async (req, res) => {
  try {
    const { poId } = req.params;
    
    // Validasi parameter
    if (!poId || isNaN(poId)) {
      return res.status(400).json({
        status: 'error',
        message: 'PO ID tidak valid'
      });
    }
    
    // Check if PO exists
    const purchaseOrder = await PurchaseOrder.findByPk(poId);
    if (!purchaseOrder) {
      return res.status(404).json({
        status: 'error',
        message: `Purchase Order dengan ID ${poId} tidak ditemukan`
      });
    }
    
    const poDetails = await PoDetail.findAll({
      where: {
        id_po: poId
      },
      include: [
        {
          model: BahanBaku,
          as: 'bahanBaku',
          attributes: ['id_bahan_baku', 'nama_bahan', 'satuan', 'harga_per_satuan'],
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: poDetails.length,
      data: {
        poDetails
      }
    });
    
  } catch (error) {
    console.error('Error in getPODetailsByPOId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data PO Detail berdasarkan PO ID',
      error: error.message
    });
  }
});

// Create new PO detail
exports.createPODetail = asyncHandler(async (req, res) => {
  try {
    const { 
      id_po, 
      id_bahan_baku, 
      jumlah, 
      harga_per_satuan, 
      jumlah_diterima, 
      status 
    } = req.body;
    
    // Validate required fields
    if (!id_po || !id_bahan_baku || !jumlah || !harga_per_satuan) {
      return res.status(400).json({
        status: 'error',
        message: "ID PO, ID Bahan Baku, jumlah, dan harga satuan tidak boleh kosong!"
      });
    }
    
    // Check if PO exists and is in draft status
    const purchaseOrder = await PurchaseOrder.findByPk(id_po);
    if (!purchaseOrder) {
      return res.status(404).json({
        status: 'error',
        message: `Purchase Order dengan ID ${id_po} tidak ditemukan`
      });
    }
    
    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Hanya dapat menambah detail pada PO dengan status draft'
      });
    }
    
    // Check if bahan baku exists
    const bahanBaku = await BahanBaku.findByPk(id_bahan_baku);
    if (!bahanBaku) {
      return res.status(404).json({
        status: 'error',
        message: `Bahan Baku dengan ID ${id_bahan_baku} tidak ditemukan`
      });
    }
    
    // Calculate subtotal
    const subtotal = parseFloat(jumlah) * parseFloat(harga_per_satuan);
    
    const poDetail = await PoDetail.create({
      id_po,
      id_bahan_baku,
      jumlah: parseFloat(jumlah),
      harga_per_satuan: parseFloat(harga_per_satuan),
      subtotal,
      jumlah_diterima: jumlah_diterima ? parseFloat(jumlah_diterima) : 0.00,
      status: status || 'pending'
    });
    
    // Update PO total_harga
    await updatePOTotalHarga(id_po);
    
    res.status(201).json({
      status: 'success',
      message: 'PO Detail berhasil dibuat',
      data: {
        poDetail
      }
    });
    
  } catch (error) {
    console.error('Error in createPODetail:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat PO Detail',
      error: error.message
    });
  }
});

// Update PO detail
exports.updatePODetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      id_bahan_baku, 
      jumlah, 
      harga_per_satuan, 
      jumlah_diterima, 
      status 
    } = req.body;
    
    // Validasi ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID tidak valid'
      });
    }
    
    const poDetail = await PoDetail.findByPk(id);
    
    if (!poDetail) {
      return res.status(404).json({
        status: 'error',
        message: `PO Detail dengan ID ${id} tidak ditemukan`
      });
    }
    
    // Check if parent PO is in draft status for item updates
    const purchaseOrder = await PurchaseOrder.findByPk(poDetail.id_po);
    if (purchaseOrder.status !== 'draft' && (id_bahan_baku || jumlah || harga_per_satuan)) {
      return res.status(400).json({
        status: 'error',
        message: 'Hanya dapat mengubah item pada PO dengan status draft'
      });
    }
    
    // If changing bahan baku, check if it exists
    if (id_bahan_baku && id_bahan_baku !== poDetail.id_bahan_baku) {
      const bahanBaku = await BahanBaku.findByPk(id_bahan_baku);
      if (!bahanBaku) {
        return res.status(404).json({
          status: 'error',
          message: `Bahan Baku dengan ID ${id_bahan_baku} tidak ditemukan`
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (id_bahan_baku !== undefined) updateData.id_bahan_baku = id_bahan_baku;
    if (jumlah !== undefined) updateData.jumlah = parseFloat(jumlah);
    if (harga_per_satuan !== undefined) updateData.harga_per_satuan = parseFloat(harga_per_satuan);
    if (jumlah_diterima !== undefined) updateData.jumlah_diterima = parseFloat(jumlah_diterima);
    if (status !== undefined) updateData.status = status;
    
    // Recalculate subtotal if jumlah or harga_per_satuan changed
    if (jumlah !== undefined || harga_per_satuan !== undefined) {
      const newJumlah = jumlah !== undefined ? parseFloat(jumlah) : poDetail.jumlah;
      const newHargaSatuan = harga_per_satuan !== undefined ? parseFloat(harga_per_satuan) : poDetail.harga_per_satuan;
      updateData.subtotal = newJumlah * newHargaSatuan;
    }
    
    await poDetail.update(updateData);
    
    // Update PO total_harga if subtotal changed
    if (updateData.subtotal !== undefined) {
      await updatePOTotalHarga(poDetail.id_po);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'PO Detail berhasil diperbarui',
      data: {
        poDetail
      }
    });
    
  } catch (error) {
    console.error('Error in updatePODetail:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui PO Detail',
      error: error.message
    });
  }
});

// Update PO detail status
exports.updatePODetailStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, jumlah_diterima } = req.body;
    
    // Validasi ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID tidak valid'
      });
    }
    
    // Validate status
    const validStatuses = ['pending', 'diterima', 'ditolak', 'parsial'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: "Status tidak valid. Status harus salah satu dari: pending, diterima, ditolak, parsial"
      });
    }
    
    const poDetail = await PoDetail.findByPk(id);
    
    if (!poDetail) {
      return res.status(404).json({
        status: 'error',
        message: `PO Detail dengan ID ${id} tidak ditemukan`
      });
    }
    
    const updateData = { status };
    
    // Update jumlah_diterima if provided
    if (jumlah_diterima !== undefined) {
      const jumlahDiterima = parseFloat(jumlah_diterima);
      
      // Validate jumlah_diterima
      if (jumlahDiterima < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Jumlah diterima tidak boleh negatif'
        });
      }
      
      if (jumlahDiterima > poDetail.jumlah) {
        return res.status(400).json({
          status: 'error',
          message: 'Jumlah diterima tidak boleh melebihi jumlah yang dipesan'
        });
      }
      
      updateData.jumlah_diterima = jumlahDiterima;
      
      // Auto-determine status based on jumlah_diterima
      if (jumlahDiterima === 0) {
        updateData.status = status === 'ditolak' ? 'ditolak' : 'pending';
      } else if (jumlahDiterima === poDetail.jumlah) {
        updateData.status = 'diterima';
      } else {
        updateData.status = 'parsial';
      }
    }
    
    await poDetail.update(updateData);
    
    res.status(200).json({
      status: 'success',
      message: `Status PO Detail berhasil diubah menjadi ${updateData.status}`,
      data: {
        poDetail
      }
    });
    
  } catch (error) {
    console.error('Error in updatePODetailStatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui status PO Detail',
      error: error.message
    });
  }
});

// Delete PO detail
exports.deletePODetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID tidak valid'
      });
    }
    
    const poDetail = await PoDetail.findByPk(id);
    
    if (!poDetail) {
      return res.status(404).json({
        status: 'error',
        message: `PO Detail dengan ID ${id} tidak ditemukan`
      });
    }
    
    // Check if parent PO is in draft status
    const purchaseOrder = await PurchaseOrder.findByPk(poDetail.id_po);
    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Hanya dapat menghapus detail pada PO dengan status draft'
      });
    }
    
    const poId = poDetail.id_po;
    await poDetail.destroy();
    
    // Update PO total_harga
    await updatePOTotalHarga(poId);
    
    res.status(200).json({
      status: 'success',
      message: 'PO Detail berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Error in deletePODetail:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus PO Detail',
      error: error.message
    });
  }
});

// Bulk create PO details
exports.bulkCreatePODetails = asyncHandler(async (req, res) => {
  try {
    const { id_po, details } = req.body;
    
    if (!id_po || !details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID PO dan array details tidak boleh kosong'
      });
    }
    
    // Check if PO exists and is in draft status
    const purchaseOrder = await PurchaseOrder.findByPk(id_po);
    if (!purchaseOrder) {
      return res.status(404).json({
        status: 'error',
        message: `Purchase Order dengan ID ${id_po} tidak ditemukan`
      });
    }
    
    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        status: 'error',
        message: 'Hanya dapat menambah detail pada PO dengan status draft'
      });
    }
    
    // Validate and prepare details
    const preparedDetails = [];
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      
      if (!detail.id_bahan_baku || !detail.jumlah || !detail.harga_per_satuan) {
        return res.status(400).json({
          status: 'error',
          message: `Detail index ${i}: ID Bahan Baku, jumlah, dan harga satuan tidak boleh kosong`
        });
      }
      
      // Check if bahan baku exists
      const bahanBaku = await BahanBaku.findByPk(detail.id_bahan_baku);
      if (!bahanBaku) {
        return res.status(404).json({
          status: 'error',
          message: `Detail index ${i}: Bahan Baku dengan ID ${detail.id_bahan_baku} tidak ditemukan`
        });
      }
      
      const subtotal = parseFloat(detail.jumlah) * parseFloat(detail.harga_per_satuan);
      
      preparedDetails.push({
        id_po,
        id_bahan_baku: detail.id_bahan_baku,
        jumlah: parseFloat(detail.jumlah),
        harga_per_satuan: parseFloat(detail.harga_per_satuan),
        subtotal,
        jumlah_diterima: detail.jumlah_diterima ? parseFloat(detail.jumlah_diterima) : 0.00,
        status: detail.status || 'pending'
      });
    }
    
    const poDetails = await PoDetail.bulkCreate(preparedDetails);
    
    // Update PO total_harga
    await updatePOTotalHarga(id_po);
    
    res.status(201).json({
      status: 'success',
      message: `${poDetails.length} PO Detail berhasil dibuat`,
      data: {
        poDetails
      }
    });
    
  } catch (error) {
    console.error('Error in bulkCreatePODetails:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat PO Detail secara bulk',
      error: error.message
    });
  }
});

// Get PO details summary by status
exports.getPODetailsSummary = asyncHandler(async (req, res) => {
  try {
    const { poId } = req.params;
    
    // Validasi PO ID
    if (!poId || isNaN(poId)) {
      return res.status(400).json({
        status: 'error',
        message: 'PO ID tidak valid'
      });
    }
    
    // Check if PO exists
    const purchaseOrder = await PurchaseOrder.findByPk(poId);
    if (!purchaseOrder) {
      return res.status(404).json({
        status: 'error',
        message: `Purchase Order dengan ID ${poId} tidak ditemukan`
      });
    }
    
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');
    
    const summary = await PoDetail.findAll({
      where: { id_po: poId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id_po_detail')), 'count'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_amount'],
        [sequelize.fn('SUM', sequelize.col('jumlah')), 'total_quantity'],
        [sequelize.fn('SUM', sequelize.col('jumlah_diterima')), 'total_received']
      ],
      group: ['status'],
      raw: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        purchaseOrder: {
          id_po: purchaseOrder.id_po,
          nomor_po: purchaseOrder.nomor_po,
          status: purchaseOrder.status
        },
        summary
      }
    });
    
  } catch (error) {
    console.error('Error in getPODetailsSummary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil summary PO Detail',
      error: error.message
    });
  }
});

// Helper function to update PO total_harga
const updatePOTotalHarga = async (poId) => {
  try {
    const { Op } = require('sequelize');
    const sequelize = require('../config/database');
    
    const result = await PoDetail.findOne({
      where: { id_po: poId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total']
      ],
      raw: true
    });
    
    const totalHarga = result.total || 0;
    
    await PurchaseOrder.update(
      { total_harga: totalHarga },
      { where: { id_po: poId } }
    );
    
  } catch (error) {
    console.error('Error in updatePOTotalHarga:', error);
    throw error;
  }
};
