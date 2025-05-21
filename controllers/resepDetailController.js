// controllers/resepDetailController.js
const ResepDetail = require('../models/ResepDetail');
const Resep = require('../models/Resep');
const BahanBaku = require('../models/BahanBaku');
const { Op } = require('sequelize');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all resep details
exports.getAllResepDetails = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, id_resep, id_bahan_baku } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  
  const offset = (page - 1) * limit;
  const where = {};
  
  if (id_resep) {
    where.id_resep = id_resep;
  }
  
  if (id_bahan_baku) {
    where.id_bahan_baku = id_bahan_baku;
  }
  
  // First get count without include to avoid the eager loading error
  const count = await ResepDetail.count({ where });
  
  // Then get rows with include
  const rows = await ResepDetail.findAll({
    where,
    limit,
    offset,
    order: [['id_resep', 'ASC'], ['id_bahan_baku', 'ASC']],
    include: [
      { model: Resep, as: 'resep' },
      { model: BahanBaku, as: 'bahan_baku' }
    ]
  });
  
  const totalPages = Math.ceil(count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      resepDetails: rows,
      pagination: {
        total: count,
        currentPage: page,
        totalPages,
        limit
      }
    }
  });
});

// Get resep detail by ID
exports.getResepDetailById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const resepDetail = await ResepDetail.findByPk(id, {
    include: [
      { model: Resep, as: 'resep' },
      { model: BahanBaku, as: 'bahan_baku' }
    ]
  });
  
  if (!resepDetail) {
    return res.status(404).json({
      status: 'error',
      message: `Detail resep dengan ID ${id} tidak ditemukan`
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      resepDetail
    }
  });
});

// Get resep details by resep ID
exports.getResepDetailsByResepId = asyncHandler(async (req, res) => {
  const { id_resep } = req.params;
  
  const resep = await Resep.findByPk(id_resep);
  
  if (!resep) {
    return res.status(404).json({
      status: 'error',
      message: `Resep dengan ID ${id_resep} tidak ditemukan`
    });
  }
  
  const resepDetails = await ResepDetail.findAll({
    where: { id_resep },
    include: [
      { model: BahanBaku, as: 'bahan_baku' }
    ],
    order: [['id_bahan_baku', 'ASC']]
  });
  
  res.status(200).json({
    status: 'success',
    results: resepDetails.length,
    data: {
      resepDetails
    }
  });
});

// Create new resep detail
exports.createResepDetail = asyncHandler(async (req, res) => {
  const { id_resep, id_bahan_baku, jumlah, unit } = req.body;
  
  // Validate resep exists
  const resep = await Resep.findByPk(id_resep);
  if (!resep) {
    return res.status(404).json({
      status: 'error',
      message: `Resep dengan ID ${id_resep} tidak ditemukan`
    });
  }
  
  // Validate bahan baku exists
  const bahanBaku = await BahanBaku.findByPk(id_bahan_baku);
  if (!bahanBaku) {
    return res.status(404).json({
      status: 'error',
      message: `Bahan baku dengan ID ${id_bahan_baku} tidak ditemukan`
    });
  }
  
  // Check if this combination already exists
  const existingDetail = await ResepDetail.findOne({
    where: {
      id_resep,
      id_bahan_baku
    }
  });
  
  if (existingDetail) {
    return res.status(400).json({
      status: 'error',
      message: `Bahan baku ini sudah ada dalam resep. Silakan update jumlahnya.`
    });
  }
  
  const resepDetail = await ResepDetail.create({
    id_resep,
    id_bahan_baku,
    jumlah,
    unit
  });
  
  const detailWithRelations = await ResepDetail.findByPk(resepDetail.id_resep_detail, {
    include: [
      { model: Resep, as: 'resep' },
      { model: BahanBaku, as: 'bahan_baku' }
    ]
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Detail resep berhasil dibuat',
    data: {
      resepDetail: detailWithRelations
    }
  });
});

// Update resep detail
exports.updateResepDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { jumlah, unit } = req.body;
  
  const resepDetail = await ResepDetail.findByPk(id);
  
  if (!resepDetail) {
    return res.status(404).json({
      status: 'error',
      message: `Detail resep dengan ID ${id} tidak ditemukan`
    });
  }
  
  await resepDetail.update({
    jumlah,
    unit
  });
  
  const updatedDetail = await ResepDetail.findByPk(id, {
    include: [
      { model: Resep, as: 'resep' },
      { model: BahanBaku, as: 'bahan_baku' }
    ]
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Detail resep berhasil diperbarui',
    data: {
      resepDetail: updatedDetail
    }
  });
});

// Delete resep detail
exports.deleteResepDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const resepDetail = await ResepDetail.findByPk(id);
  
  if (!resepDetail) {
    return res.status(404).json({
      status: 'error',
      message: `Detail resep dengan ID ${id} tidak ditemukan`
    });
  }
  
  await resepDetail.destroy();
  
  res.status(200).json({
    status: 'success',
    message: 'Detail resep berhasil dihapus'
  });
});

// Batch create resep details (add multiple ingredients at once)
exports.batchCreateResepDetails = asyncHandler(async (req, res) => {
  const { id_resep, bahan_list } = req.body;
  
  if (!bahan_list || !Array.isArray(bahan_list) || bahan_list.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Daftar bahan tidak valid. Harus berupa array dengan minimal 1 item'
    });
  }
  
  // Validate resep exists
  const resep = await Resep.findByPk(id_resep);
  if (!resep) {
    return res.status(404).json({
      status: 'error',
      message: `Resep dengan ID ${id_resep} tidak ditemukan`
    });
  }
  
  // Get existing bahan in this recipe
  const existingDetails = await ResepDetail.findAll({
    where: { id_resep }
  });
  
  const existingBahanIds = existingDetails.map(detail => detail.id_bahan_baku);
  
  // Prepare data for bulk create
  const detailsToCreate = [];
  const errors = [];
  
  for (const bahan of bahan_list) {
    const { id_bahan_baku, jumlah, unit } = bahan;
    
    // Check if bahan exists
    const bahanExists = await BahanBaku.findByPk(id_bahan_baku);
    if (!bahanExists) {
      errors.push(`Bahan baku dengan ID ${id_bahan_baku} tidak ditemukan`);
      continue;
    }
    
    // Check if this bahan is already in the recipe
    if (existingBahanIds.includes(id_bahan_baku)) {
      errors.push(`Bahan baku dengan ID ${id_bahan_baku} sudah ada dalam resep`);
      continue;
    }
    
    detailsToCreate.push({
      id_resep,
      id_bahan_baku,
      jumlah,
      unit
    });
  }
  
  if (detailsToCreate.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Tidak ada bahan yang dapat ditambahkan',
      errors
    });
  }
  
  // Bulk create
  const createdDetails = await ResepDetail.bulkCreate(detailsToCreate);
  
  res.status(201).json({
    status: 'success',
    message: `${createdDetails.length} bahan berhasil ditambahkan ke resep`,
    warnings: errors.length > 0 ? errors : undefined,
    data: {
      resepDetails: createdDetails
    }
  });
});

// Batch update resep details
exports.batchUpdateResepDetails = asyncHandler(async (req, res) => {
  const { id_resep } = req.params;
  const { updates } = req.body;
  
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Daftar update tidak valid. Harus berupa array dengan minimal 1 item'
    });
  }
  
  // Validate resep exists
  const resep = await Resep.findByPk(id_resep);
  if (!resep) {
    return res.status(404).json({
      status: 'error',
      message: `Resep dengan ID ${id_resep} tidak ditemukan`
    });
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process each update
  for (const update of updates) {
    const { id_bahan_baku, jumlah, unit } = update;
    
    try {
      const detail = await ResepDetail.findOne({
        where: {
          id_resep,
          id_bahan_baku
        }
      });
      
      if (!detail) {
        results.failed.push({
          id_bahan_baku,
          message: `Bahan baku dengan ID ${id_bahan_baku} tidak ditemukan dalam resep ini`
        });
        continue;
      }
      
      await detail.update({ jumlah, unit });
      results.success.push({
        id_resep_detail: detail.id_resep_detail,
        id_bahan_baku
      });
    } catch (error) {
      results.failed.push({
        id_bahan_baku,
        message: error.message
      });
    }
  }
  
  res.status(200).json({
    status: results.failed.length === 0 ? 'success' : 'partial',
    message: `${results.success.length} dari ${updates.length} bahan berhasil diperbarui`,
    data: results
  });
});