// models/supplier.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id_supplier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nama_supplier: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nama supplier tidak boleh kosong'
      },
      len: {
        args: [1, 100],
        msg: 'Nama supplier harus antara 1-100 karakter'
      }
    }
  },
  kontak_person: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Kontak person maksimal 100 karakter'
      }
    }
  },
  telepon: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Nomor telepon maksimal 20 karakter'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Format email tidak valid'
      },
      len: {
        args: [0, 100],
        msg: 'Email maksimal 100 karakter'
      }
    }
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true
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
  }
}, {
  tableName: 'supplier',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['nama_supplier'] 
    },
    {
      fields: ['status']
    },
    {
      fields: ['email']
    }
  ]
});

// Instance methods
Supplier.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Class methods
Supplier.findByStatus = function(status, options = {}) {
  return this.findAll({
    where: { status },
    ...options
  });
};

Supplier.searchByName = function(name, options = {}) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      nama_supplier: {
        [Op.like]: `%${name}%`
      }
    },
    ...options
  });
};

Supplier.searchByContact = function(contact, options = {}) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      kontak_person: {
        [Op.like]: `%${contact}%`
      }
    },
    ...options
  });
};

module.exports = Supplier;