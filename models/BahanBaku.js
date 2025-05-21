const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

const BahanBaku = sequelize.define('BahanBaku', {
  id_bahan_baku: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nama_bahan: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nama bahan tidak boleh kosong'
      },
      len: {
        args: [1, 100],
        msg: 'Nama bahan harus antara 1-100 karakter'
      }
    }
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplier,
      key: 'id_supplier'
    },
    validate: {
      notNull: {
        msg: 'Supplier harus dipilih'
      }
    }
  },
  satuan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Satuan tidak boleh kosong'
      },
      len: {
        args: [1, 20],
        msg: 'Satuan maksimal 20 karakter'
      }
    }
  },
  stok: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'Stok harus berupa angka'
      }
    }
  },
  harga_per_satuan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'Harga harus berupa angka'
      }
    }
  },
  stok_minimum: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'Stok minimum harus berupa angka'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('aktif', 'tidak_aktif'),
    allowNull: false,
    defaultValue: 'aktif',
    validate: {
      isIn: {
        args: [['aktif', 'tidak_aktif']],
        msg: 'Status harus berupa aktif atau tidak_aktif'
      }
    }
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bahan_baku',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['supplier_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['nama_bahan']
    }
  ],
  // Jangan ubah struktur tabel yang sudah ada
  sync: { alter: false, force: false }
});

// Define relationship
BahanBaku.belongsTo(Supplier, { foreignKey: 'supplier_id' });
Supplier.hasMany(BahanBaku, { foreignKey: 'supplier_id' });

// Instance methods
BahanBaku.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Class methods
BahanBaku.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status },
    ...options
  });
};

BahanBaku.findBySupplier = function(supplier_id, options = {}) {
  return this.findAll({
    where: { supplier_id },
    ...options
  });
};

BahanBaku.searchByName = function(name, options = {}) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      nama_bahan: {
        [Op.like]: `%${name}%`
      }
    },
    ...options
  });
};

BahanBaku.getLowStock = function(options = {}) {
  return this.findAll({
    where: sequelize.literal('stok <= stok_minimum'),
    ...options
  });
};

module.exports = BahanBaku;