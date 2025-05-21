// models/resep.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


  const Resep = sequelize.define('Resep', {
    id_resep: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nama_resep: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nama resep tidak boleh kosong'
        },
        len: {
          args: [1, 100],
          msg: 'Nama resep harus antara 1-100 karakter'
        }
      }
    },
    kategori: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Kategori maksimal 50 karakter'
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
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'resep',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['kategori']
      },
      {
        fields: ['status']
      },
      {
        fields: ['nama_resep']
      }
    ]
  });

  // Instance methods
  Resep.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  // Class methods
  Resep.findByStatus = function(status, options = {}) {
    return this.findAll({
      where: { status },
      ...options
    });
  };

  Resep.findByKategori = function(kategori, options = {}) {
    return this.findAll({
      where: { kategori },
      ...options
    });
  };

  Resep.searchByName = function(name, options = {}) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        nama_resep: {
          [Op.like]: `%${name}%`
        }
      },
      ...options
    });
  };

  module.exports = Resep;
