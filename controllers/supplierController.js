// controllers/supplierController.js
const Supplier = require('../models/Supplier');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all suppliers
exports.getAllSuppliers = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, status, search } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  
  const offset = (page - 1) * limit;
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (search) {
    const { Op } = require('sequelize');
    where.nama_supplier = { [Op.like]: `%${search}%` };
  }
  
  const suppliers = await Supplier.findAndCountAll({
    where,
    limit,
    offset,
    order: [['nama_supplier', 'ASC']]
  });
  
  const totalPages = Math.ceil(suppliers.count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      suppliers: suppliers.rows,
      pagination: {
        total: suppliers.count,
        currentPage: page,
        totalPages,
        limit
      }
    }
  });
});

// Get supplier by ID
exports.getSupplierById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const supplier = await Supplier.findByPk(id);
  
  if (!supplier) {
    return res.status(404).json({
      status: 'error',
      message: `Supplier dengan ID ${id} tidak ditemukan`
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      supplier
    }
  });
});

// Create new supplier
exports.createSupplier = asyncHandler(async (req, res) => {
  const { nama_supplier, kontak_person, telepon, email, alamat, status } = req.body;
  
  const supplier = await Supplier.create({
    nama_supplier,
    kontak_person,
    telepon,
    email,
    alamat,
    status
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Supplier berhasil dibuat',
    data: {
      supplier
    }
  });
});

// Update supplier
exports.updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama_supplier, kontak_person, telepon, email, alamat, status } = req.body;
  
  const supplier = await Supplier.findByPk(id);
  
  if (!supplier) {
    return res.status(404).json({
      status: 'error',
      message: `Supplier dengan ID ${id} tidak ditemukan`
    });
  }
  
  await supplier.update({
    nama_supplier,
    kontak_person,
    telepon,
    email,
    alamat,
    status
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Supplier berhasil diperbarui',
    data: {
      supplier
    }
  });
});

// Delete supplier
exports.deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const supplier = await Supplier.findByPk(id);
  
  if (!supplier) {
    return res.status(404).json({
      status: 'error',
      message: `Supplier dengan ID ${id} tidak ditemukan`
    });
  }
  
  // Soft delete by updating status
  await supplier.update({ status: 'tidak_aktif' });
  
  res.status(200).json({
    status: 'success',
    message: 'Supplier berhasil dinonaktifkan'
  });
});

// Permanently delete supplier (only for admins or special cases)
exports.permanentDeleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const supplier = await Supplier.findByPk(id);
  
  if (!supplier) {
    return res.status(404).json({
      status: 'error',
      message: `Supplier dengan ID ${id} tidak ditemukan`
    });
  }
  
  await supplier.destroy();
  
  res.status(200).json({
    status: 'success',
    message: 'Supplier berhasil dihapus permanen'
  });
});

// Search suppliers
exports.searchSuppliers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: 'Parameter pencarian diperlukan'
    });
  }
  
  const { Op } = require('sequelize');
  
  const suppliers = await Supplier.findAll({
    where: {
      [Op.or]: [
        { nama_supplier: { [Op.like]: `%${query}%` } }
        // { kontak_person: { [Op.like]: `%${query}%` } },
        // { email: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['nama_supplier', 'ASC']]
  });
  
  res.status(200).json({
    status: 'success',
    results: suppliers.length,
    data: {
      suppliers
    }
  });
});