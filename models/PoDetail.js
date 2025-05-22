// models/PODetail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PoDetail = sequelize.define('PoDetail', {
  id_po_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_po: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_order',
      key: 'id_po'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  id_bahan_baku: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bahan_baku',
      key: 'id_bahan_baku'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  jumlah: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  harga_satuan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  jumlah_diterima: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true,
      customValidator(value) {
        if (parseFloat(value) > parseFloat(this.jumlah)) {
          throw new Error('Jumlah diterima tidak boleh melebihi jumlah yang dipesan');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'diterima', 'ditolak', 'parsial'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'diterima', 'ditolak', 'parsial']]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'po_detail',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Hook untuk auto-calculate subtotal sebelum create
    beforeCreate: (poDetail, options) => {
      poDetail.subtotal = parseFloat(poDetail.jumlah) * parseFloat(poDetail.harga_satuan);
    },
    // Hook untuk auto-calculate subtotal sebelum update
    beforeUpdate: (poDetail, options) => {
      if (poDetail.changed('jumlah') || poDetail.changed('harga_satuan')) {
        poDetail.subtotal = parseFloat(poDetail.jumlah) * parseFloat(poDetail.harga_satuan);
      }
    },
    // Hook untuk auto-determine status berdasarkan jumlah_diterima
    beforeSave: (poDetail, options) => {
      if (poDetail.changed('jumlah_diterima')) {
        const jumlahDiterima = parseFloat(poDetail.jumlah_diterima);
        const jumlahPesan = parseFloat(poDetail.jumlah);
        
        if (jumlahDiterima === 0) {
          // Jika belum terima sama sekali, status tetap pending kecuali explicitly ditolak
          if (poDetail.status !== 'ditolak') {
            poDetail.status = 'pending';
          }
        } else if (jumlahDiterima === jumlahPesan) {
          // Jika terima full, status jadi diterima
          poDetail.status = 'diterima';
        } else if (jumlahDiterima < jumlahPesan) {
          // Jika terima sebagian, status jadi parsial
          poDetail.status = 'parsial';
        }
      }
    }
  },
  indexes: [
    {
      fields: ['id_po']
    },
    {
      fields: ['id_bahan_baku']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['id_po', 'id_bahan_baku'],
      unique: false // Allow same bahan_baku multiple times in same PO
    }
  ]
});

module.exports = PoDetail;