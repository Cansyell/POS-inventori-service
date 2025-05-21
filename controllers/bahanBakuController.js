const BahanBaku = require('../models/BahanBaku');
const Supplier = require('../models/Supplier');
const { Op, Sequelize } = require('sequelize');

/**
 * Fungsi untuk memeriksa keberadaan bahan baku
 * @param {string} nama_bahan - Nama bahan yang akan dicek
 * @param {number} id_bahan_baku - ID bahan (opsional, untuk kasus update)
 * @returns {Promise<{isAvailable: boolean, message: string}>} - Status ketersediaan dan pesan
 */
const checkBahanExistence = async (nama_bahan, id_bahan_baku = null) => {
  try {
    // Validasi input
    if (!nama_bahan) {
      return {
        isAvailable: false,
        message: 'Nama bahan tidak boleh kosong'
      };
    }

    // Buat kondisi untuk mencari bahan dengan nama yang sama
    const whereCondition = {
      nama_bahan: nama_bahan
    };
    
    // Jika ini adalah update, exclude bahan yang sedang diupdate
    if (id_bahan_baku) {
      whereCondition.id_bahan_baku = {
        [Op.ne]: id_bahan_baku
      };
    }

    // Cek apakah ada bahan dengan nama yang sama
    const existingBahan = await BahanBaku.findOne({
      where: whereCondition
    });
    
    if (existingBahan) {
      return {
        isAvailable: false,
        message: 'Nama bahan sudah digunakan',
        existingBahan: existingBahan
      };
    }
    
    return {
      isAvailable: true,
      message: 'Nama bahan tersedia'
    };
    
  } catch (error) {
    console.error('Error checking bahan existence:', error);
    return {
      isAvailable: false,
      message: `Gagal memeriksa ketersediaan nama bahan: ${error.message || 'Unknown error'}`
    };
  }
};

// Membuat bahan baku baru
exports.createBahanBaku = async (req, res) => {
  try {
    const { 
      nama_bahan, 
      supplier_id, 
      satuan, 
      stok, 
      harga_per_satuan, 
      stok_minimum, 
      status, 
      keterangan 
    } = req.body;
    
    // Validasi input
    if (!nama_bahan || !supplier_id || !satuan) {
      return res.status(400).json({ 
        message: 'Data tidak lengkap, nama bahan, supplier, dan satuan harus diisi' 
      });
    }
    
    // Cek keberadaan supplier
    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan' });
    }
    
    // Cek ketersediaan nama bahan
    const existenceCheck = await checkBahanExistence(nama_bahan);
    
    if (!existenceCheck.isAvailable) {
      return res.status(400).json({ message: existenceCheck.message });
    }
      
    // Buat bahan baku
    const bahanBaku = await BahanBaku.create({
      nama_bahan,
      supplier_id,
      satuan,
      stok: stok || 0,
      harga_per_satuan: harga_per_satuan || 0,
      stok_minimum: stok_minimum || 0,
      status: status || 'aktif',
      keterangan: keterangan || null
    });
    
    res.status(201).json({
      message: 'Bahan baku berhasil dibuat',
      bahanBaku
    });
  } catch (error) {
    console.error('Error creating bahan baku:', error);
    res.status(500).json({ 
      message: 'Gagal membuat bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan semua bahan baku
exports.getAllBahanBaku = async (req, res) => {
  try {
    const { status, supplier_id, search, page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    
    // Prepare where condition based on filters
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (supplier_id) {
      whereCondition.supplier_id = supplier_id;
    }
    
    if (search) {
      whereCondition.nama_bahan = {
        [Op.like]: `%${search}%`
      };
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Prepare ordering
    const order = [[sort_by, sort_order]];
    
    // Get bahan baku with pagination
    const { count, rows: bahanBaku } = await BahanBaku.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Supplier, attributes: ['id_supplier', 'nama_supplier', 'email', 'telepon'] }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      message: 'Berhasil mengambil data bahan baku',
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
      bahanBaku
    });
  } catch (error) {
    console.error('Error fetching bahan baku:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan bahan baku berdasarkan ID
exports.getBahanBakuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bahanBaku = await BahanBaku.findByPk(id, {
      include: [
        { model: Supplier, attributes: ['id_supplier', 'nama_supplier', 'email', 'telepon'] }
      ]
    });
    
    if (!bahanBaku) {
      return res.status(404).json({ message: 'Bahan baku tidak ditemukan' });
    }
    
    res.status(200).json({
      message: 'Berhasil mengambil data bahan baku',
      bahanBaku
    });
  } catch (error) {
    console.error('Error fetching bahan baku by ID:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mengupdate data bahan baku
exports.updateBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nama_bahan, 
      supplier_id, 
      satuan, 
      stok, 
      harga_per_satuan, 
      stok_minimum, 
      status, 
      keterangan 
    } = req.body;
    
    // Cek apakah bahan baku ada
    const bahanBaku = await BahanBaku.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: 'Bahan baku tidak ditemukan' });
    }
    
    // Cek keberadaan supplier jika diganti
    if (supplier_id && supplier_id !== bahanBaku.supplier_id) {
      const supplier = await Supplier.findByPk(supplier_id);
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier tidak ditemukan' });
      }
    }
    
    // Jika nama bahan diubah, cek ketersediaan nama baru
    if (nama_bahan && nama_bahan !== bahanBaku.nama_bahan) {
      const existenceCheck = await checkBahanExistence(nama_bahan, id);
      
      if (!existenceCheck.isAvailable) {
        return res.status(400).json({ message: existenceCheck.message });
      }
    }
    
    // Update bahan baku
    const updatedFields = {};
    if (nama_bahan) updatedFields.nama_bahan = nama_bahan;
    if (supplier_id) updatedFields.supplier_id = supplier_id;
    if (satuan) updatedFields.satuan = satuan;
    if (stok !== undefined) updatedFields.stok = stok;
    if (harga_per_satuan !== undefined) updatedFields.harga_per_satuan = harga_per_satuan;
    if (stok_minimum !== undefined) updatedFields.stok_minimum = stok_minimum;
    if (status) updatedFields.status = status;
    if (keterangan !== undefined) updatedFields.keterangan = keterangan;
    
    await bahanBaku.update(updatedFields);
    
    // Get updated bahan baku with supplier info
    const updatedBahanBaku = await BahanBaku.findByPk(id, {
      include: [
        { model: Supplier, attributes: ['id_supplier', 'nama_supplier', 'email', 'telepon'] }
      ]
    });
    
    res.status(200).json({
      message: 'Bahan baku berhasil diupdate',
      bahanBaku: updatedBahanBaku
    });
  } catch (error) {
    console.error('Error updating bahan baku:', error);
    res.status(500).json({ 
      message: 'Gagal mengupdate bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Menghapus bahan baku
exports.deleteBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bahanBaku = await BahanBaku.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: 'Bahan baku tidak ditemukan' });
    }
    
    // Hapus bahan baku
    await bahanBaku.destroy();
    
    res.status(200).json({
      message: 'Bahan baku berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting bahan baku:', error);
    res.status(500).json({ 
      message: 'Gagal menghapus bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mengubah status bahan baku
exports.updateBahanBakuStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate input
    if (!status || !['aktif', 'tidak_aktif'].includes(status)) {
      return res.status(400).json({ message: 'Status harus berupa aktif atau tidak_aktif' });
    }
    
    const bahanBaku = await BahanBaku.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: 'Bahan baku tidak ditemukan' });
    }
    
    // Update status
    bahanBaku.status = status;
    await bahanBaku.save();
    
    res.status(200).json({
      message: `Status bahan baku berhasil diubah menjadi ${status}`,
      bahanBaku
    });
  } catch (error) {
    console.error('Error updating bahan baku status:', error);
    res.status(500).json({ 
      message: 'Gagal mengubah status bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Update stok bahan baku
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah, tipe, keterangan } = req.body;
    
    // Validasi input
    if (jumlah === undefined || !tipe || !['tambah', 'kurang'].includes(tipe)) {
      return res.status(400).json({ 
        message: 'Data tidak lengkap, jumlah dan tipe (tambah/kurang) harus diisi' 
      });
    }
    
    const bahanBaku = await BahanBaku.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: 'Bahan baku tidak ditemukan' });
    }
    
    // Convert jumlah ke number
    const jumlahAngka = parseFloat(jumlah);
    
    if (isNaN(jumlahAngka) || jumlahAngka <= 0) {
      return res.status(400).json({ message: 'Jumlah harus berupa angka positif' });
    }
    
    // Hitung stok baru
    let stokBaru;
    if (tipe === 'tambah') {
      stokBaru = parseFloat(bahanBaku.stok) + jumlahAngka;
    } else { // tipe === 'kurang'
      stokBaru = parseFloat(bahanBaku.stok) - jumlahAngka;
      
      // Validasi stok tidak boleh negatif
      if (stokBaru < 0) {
        return res.status(400).json({ 
          message: 'Stok tidak cukup', 
          stokTersedia: bahanBaku.stok 
        });
      }
    }
    
    // Update stok
    bahanBaku.stok = stokBaru;
    
    // Tambahkan keterangan jika ada
    if (keterangan) {
      bahanBaku.keterangan = keterangan;
    }
    
    await bahanBaku.save();
    
    res.status(200).json({
      message: `Stok bahan baku berhasil di${tipe}`,
      stokLama: parseFloat(bahanBaku.stok) - (tipe === 'tambah' ? jumlahAngka : -jumlahAngka),
      stokBaru: bahanBaku.stok,
      bahanBaku
    });
  } catch (error) {
    console.error('Error updating bahan baku stock:', error);
    res.status(500).json({ 
      message: 'Gagal mengupdate stok bahan baku', 
      error: error.message || 'Unknown error'
    });
  }
};

// Mendapatkan bahan baku dengan stok dibawah minimum
// Mendapatkan bahan baku dengan stok di bawah minimum
exports.getLowStock = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: bahanBaku } = await BahanBaku.findAndCountAll({
      where: {
        stok: {
          [Op.lt]: Sequelize.col('stok_minimum')
        }
      },
      include: [
        { model: Supplier, attributes: ['id_supplier', 'nama_supplier', 'email', 'telepon'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['stok', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      message: 'Berhasil mengambil data bahan baku dengan stok rendah',
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
      bahanBaku
    });
  } catch (error) {
    console.error('Error fetching low stock bahan baku:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data stok rendah', 
      error: error.message || 'Unknown error'
    });
  }
};


// Endpoint untuk cek ketersediaan nama bahan
exports.checkAvailability = async (req, res) => {
  try {
    const { nama_bahan, id_bahan_baku } = req.body;
    
    const result = await checkBahanExistence(nama_bahan, id_bahan_baku);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      isAvailable: false,
      message: `Error: ${error.message}`
    });
  }
};