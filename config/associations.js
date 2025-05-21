// config/associations.js
const Resep = require('../models/Resep');
const BahanBaku = require('../models/BahanBaku');
const ResepDetail = require('../models/ResepDetail');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

// Setup all associations
const setupAssociations = () => {
  // Supplier - BahanBaku (already defined in BahanBaku model)
  Supplier.hasMany(BahanBaku, { 
    foreignKey: 'supplier_id',
    as: 'bahan_baku'
  });
  
  BahanBaku.belongsTo(Supplier, { 
    foreignKey: 'supplier_id',
    as: 'supplier'
  });

  // Resep - ResepDetail
  Resep.hasMany(ResepDetail, {
    foreignKey: 'id_resep',
    as: 'resep_detail'
  });
  
  ResepDetail.belongsTo(Resep, {
    foreignKey: 'id_resep',
    as: 'resep'
  });

  // BahanBaku - ResepDetail
  BahanBaku.hasMany(ResepDetail, {
    foreignKey: 'id_bahan_baku',
    as: 'resep_detail'
  });
  
  ResepDetail.belongsTo(BahanBaku, {
    foreignKey: 'id_bahan_baku',
    as: 'bahan_baku'
  });
  // Supplier - PurchaseOrder (asosiasi yang kamu minta)
  Supplier.hasMany(PurchaseOrder, {
    foreignKey: 'supplier_id',
    as: 'purchase_orders'
  });

  PurchaseOrder.belongsTo(Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });
};

module.exports = setupAssociations;