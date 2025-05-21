const Resep = require('../models/Resep');
const { Op, Sequelize } = require('sequelize');

/**
 * Fungsi untuk memeriksa keberadaan resep
 * @param {string} nama_resep - Nama resep yang akan dicek
 * @param {number} id_resep - ID resep (opsional, untuk kasus update)
 * @returns {Promise<{isAvailable: boolean, message: string}>} - Status ketersediaan dan pesan
 */
const checkResepExistence = async (nama_resep, id_resep = null) => {
  try {
    // Validasi input
    if (!nama_resep) {
      return {
        isAvailable: false,
        message: 'Nama resep tidak boleh kosong'
      };
    }

    // Buat kondisi untuk mencari resep dengan nama yang sama
    const whereCondition = {
      nama_resep: nama_resep
    };
    
    // Jika ini adalah update, exclude resep yang sedang diupdate
    if (id_resep) {
      whereCondition.id_resep = {
        [Op.ne]: id_resep
      };
    }

    // Cek apakah ada resep dengan nama yang sama
    const existingResep = await Resep.findOne({
      where: whereCondition
    });
    
    if (existingResep) {
      return {
        isAvailable: false,
        message: 'Nama resep sudah digunakan',
        existingResep: existingResep
      };
    }
    
    return {
      isAvailable: true,
      message: 'Nama resep tersedia'
    };
    
  } catch (error) {
    console.error('Error checking resep existence:', error);
    return {
      isAvailable: false,
      message: `Gagal memeriksa ketersediaan nama resep: ${error.message || 'Unknown error'}`
    };
  }
};

// Membuat resep baru
exports.createResep = async (req, res) => {
  try {
    const { nama_resep, kategori, status, catatan } = req.body;
    
    // Validasi input
    if (!nama_resep) {
      return res.status(400).json({ message: 'Nama resep harus diisi' });
    }
    
    // Cek ketersediaan nama resep
    const existenceCheck = await checkResepExistence(nama_resep);
    
    if (!existenceCheck.isAvailable) {
      return res.status(400).json({ message: existenceCheck.message });
    }
      
    // Buat resep
    const resep = await Resep.create({
      nama_resep,
      kategori: kategori || null,
      status: status || 'aktif',
      catatan: catatan || null
    });
    
    res.status(201).json({
      message: 'Resep berhasil dibuat',
      resep
    });
  } catch (error) {
    console.error('Error creating resep:', error);
    res.status(500).json({ 
      message: 'Gagal membuat resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan semua resep
exports.getAllResep = async (req, res) => {
  try {
    const { status, kategori, search, page = 1, limit = 10 } = req.query;
    
    // Prepare where condition based on filters
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (kategori) {
      whereCondition.kategori = kategori;
    }
    
    if (search) {
      whereCondition.nama_resep = {
        [Op.like]: `%${search}%`
      };
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get resep with pagination
    const { count, rows: resep } = await Resep.findAndCountAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      message: 'Berhasil mengambil data resep',
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
      resep
    });
  } catch (error) {
    console.error('Error fetching resep:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan resep berdasarkan ID
exports.getResepById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resep = await Resep.findByPk(id);
    
    if (!resep) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Berhasil mengambil data resep',
      resep
    });
  } catch (error) {
    console.error('Error fetching resep by ID:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mengupdate data resep
exports.updateResep = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_resep, kategori, status, catatan } = req.body;
    
    // Cek apakah resep ada
    const resep = await Resep.findByPk(id);
    if (!resep) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    
    // Jika nama resep diubah, cek ketersediaan nama baru
    if (nama_resep && nama_resep !== resep.nama_resep) {
      const existenceCheck = await checkResepExistence(nama_resep, id);
      
      if (!existenceCheck.isAvailable) {
        return res.status(400).json({ message: existenceCheck.message });
      }
    }
    
    // Update resep
    const updatedFields = {};
    if (nama_resep) updatedFields.nama_resep = nama_resep;
    if (kategori !== undefined) updatedFields.kategori = kategori;
    if (status) updatedFields.status = status;
    if (catatan !== undefined) updatedFields.catatan = catatan;
    
    await resep.update(updatedFields);
    
    res.status(200).json({
      message: 'Resep berhasil diupdate',
      resep
    });
  } catch (error) {
    console.error('Error updating resep:', error);
    res.status(500).json({ 
      message: 'Gagal mengupdate resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Menghapus resep
exports.deleteResep = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resep = await Resep.findByPk(id);
    if (!resep) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    
    // Hapus resep
    await resep.destroy();
    
    res.status(200).json({
      message: 'Resep berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting resep:', error);
    res.status(500).json({ 
      message: 'Gagal menghapus resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mengubah status resep
exports.updateResepStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate input
    if (!status || !['aktif', 'tidak_aktif'].includes(status)) {
      return res.status(400).json({ message: 'Status harus berupa aktif atau tidak_aktif' });
    }
    
    const resep = await Resep.findByPk(id);
    if (!resep) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }
    
    // Update status
    resep.status = status;
    await resep.save();
    
    res.status(200).json({
      message: `Status resep berhasil diubah menjadi ${status}`,
      resep
    });
  } catch (error) {
    console.error('Error updating resep status:', error);
    res.status(500).json({ 
      message: 'Gagal mengubah status resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan kategori yang tersedia
exports.getKategori = async (req, res) => {
  try {
    const kategori = await Resep.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('kategori')), 'kategori']
      ],
      where: {
        kategori: {
          [Op.ne]: null
        }
      }
    });
    
    // Extract kategori values
    const kategoriList = kategori.map(item => item.get('kategori'));
    
    res.status(200).json({
      message: 'Berhasil mengambil data kategori',
      kategori: kategoriList
    });
  } catch (error) {
    console.error('Error fetching kategori:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data kategori', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mencari resep berdasarkan nama
exports.searchResep = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'Parameter pencarian nama tidak boleh kosong' });
    }
    
    const resep = await Resep.searchByName(name);
    
    res.status(200).json({
      message: 'Berhasil mencari resep',
      count: resep.length,
      resep
    });
  } catch (error) {
    console.error('Error searching resep:', error);
    res.status(500).json({ 
      message: 'Gagal mencari resep', 
      error: error.message || 'Unknown error'
    });
  }
};

// Endpoint untuk cek ketersediaan nama resep
exports.checkAvailability = async (req, res) => {
  try {
    const { nama_resep, id_resep } = req.body;
    
    const result = await checkResepExistence(nama_resep, id_resep);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      isAvailable: false,
      message: `Error: ${error.message}`
    });
  }
};