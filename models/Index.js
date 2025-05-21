// models/index.js

const Sequelize = require('sequelize');
const sequelize = new Sequelize(/* config */);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Resep = require('./Resep')(sequelize, Sequelize.DataTypes);

module.exports = db;
