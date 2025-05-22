// config/associations.js
const Resep = require('../models/Resep');
const BahanBaku = require('../models/BahanBaku');
const ResepDetail = require('../models/ResepDetail');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const PoDetail = require('../models/PoDetail');

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

  //po detail
  PoDetail.belongsTo(PurchaseOrder, {
    foreignKey: 'id_po',
    as: 'purchaseOrder'
  });
  
  PoDetail.belongsTo(BahanBaku, {
    foreignKey: 'id_bahan_baku',
    as: 'bahanBaku'
  });

  PurchaseOrder.hasMany(PoDetail, {
    foreignKey: 'id_po',
    as: 'poDetails'
  });

  BahanBaku.hasMany(PoDetail, {
    foreignKey: 'id_bahan_baku',
    as: 'poDetails'
  });

};

module.exports = setupAssociations;