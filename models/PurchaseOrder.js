// models/PurchaseOrder.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id_po: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nomor_po: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Nomor PO tidak boleh kosong'
      },
      len: {
        args: [1, 20],
        msg: 'Nomor PO harus antara 1-20 karakter'
      }
    }
  },
  tanggal_po: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Tanggal PO tidak boleh kosong'
      },
      isDate: {
        msg: 'Format tanggal PO tidak valid'
      }
    }
  },
  supplier_id: {
  type: DataTypes.INTEGER,
  allowNull: false, // <-- Tambahkan ini
  references: {
    model: 'Supplier',
    key: 'id_supplier'
  },
  validate: {
    notNull: {
      msg: 'Supplier harus dipilih'
    }
  }
},
  status: {
    type: DataTypes.ENUM('draft', 'dikirim', 'diterima', 'dibatalkan'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: {
        args: [['draft', 'dikirim', 'diterima', 'dibatalkan']],
        msg: 'Status harus berupa draft, dikirim, diterima, atau dibatalkan'
      }
    }
  },
  total_harga: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    validate: {
      isDecimal: {
        msg: 'Total harga harus berupa angka'
      },
      min: {
        args: [0],
        msg: 'Total harga tidak boleh negatif'
      }
    }
  },
  tanggal_pengiriman_diharapkan: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Format tanggal pengiriman yang diharapkan tidak valid'
      }
    }
  },
  tanggal_pengiriman_aktual: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Format tanggal pengiriman aktual tidak valid'
      }
    }
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dibuat_oleh: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: {
        args: [0, 50],
        msg: 'Nama pembuat maksimal 50 karakter'
      }
    }
  }
}, {
  tableName: 'purchase_order',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['nomor_po']
    },
    {
      fields: ['tanggal_po']
    },
    {
      fields: ['supplier_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['dibuat_oleh']
    }
  ]
});

// Instance methods
PurchaseOrder.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Function to check if PO can be updated based on status
PurchaseOrder.prototype.canBeUpdated = function() {
  return this.status === 'draft';
};

// Function to check if PO can be cancelled
PurchaseOrder.prototype.canBeCancelled = function() {
  return ['draft', 'dikirim'].includes(this.status);
};

// Class methods
PurchaseOrder.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status },
    ...options
  });
};

PurchaseOrder.findBySupplier = function(supplierId, options = {}) {
  return this.findAll({
    where: { supplier_id: supplierId },
    ...options
  });
};

PurchaseOrder.searchByNomorPO = function(nomorPO, options = {}) {
  return this.findAll({
    where: {
      nomor_po: {
        [Op.like]: `%${nomorPO}%`
      }
    },
    ...options
  });
};

PurchaseOrder.findByDateRange = function(startDate, endDate, options = {}) {
  return this.findAll({
    where: {
      tanggal_po: {
        [Op.between]: [startDate, endDate]
      }
    },
    ...options
  });
};

PurchaseOrder.findRecentOrders = function(limit = 10, options = {}) {
  return this.findAll({
    order: [['tanggal_po', 'DESC']],
    limit,
    ...options
  });
};

// Model associations
PurchaseOrder.associate = function(models) {
  PurchaseOrder.belongsTo(models.Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });
  
  // If you have purchase order items table, you can define the relationship here
  // PurchaseOrder.hasMany(models.PurchaseOrderItem, {
  //   foreignKey: 'purchase_order_id',
  //   as: 'items'
  // });
};

module.exports = PurchaseOrder;