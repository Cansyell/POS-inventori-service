// models/resep_detail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResepDetail = sequelize.define('ResepDetail', {
  id_resep_detail: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_resep: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resep',
      key: 'id_resep'
    },
    validate: {
      notNull: {
        msg: 'ID resep tidak boleh kosong'
      }
    }
  },
  id_bahan_baku: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bahan_baku',
      key: 'id_bahan_baku'
    },
    validate: {
      notNull: {
        msg: 'ID bahan baku tidak boleh kosong'
      }
    }
  },
  jumlah: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      isDecimal: {
        msg: 'Jumlah harus berupa angka desimal'
      },
      min: {
        args: [0],
        msg: 'Jumlah tidak boleh negatif'
      }
    }
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Unit maksimal 20 karakter'
      }
    }
  }
}, {
  tableName: 'resep_detail',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_resep']
    },
    {
      fields: ['id_bahan_baku']
    }
  ]
});

// Instance methods
ResepDetail.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Class methods
ResepDetail.findByResepId = function(id_resep, options = {}) {
  return this.findAll({
    where: { id_resep },
    ...options
  });
};

ResepDetail.findByBahanBakuId = function(id_bahan_baku, options = {}) {
  return this.findAll({
    where: { id_bahan_baku },
    ...options
  });
};

// Note: We'll use the associations defined in config/associations.js

module.exports = ResepDetail;