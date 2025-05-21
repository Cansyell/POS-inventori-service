const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();
const app = express();
const sequelize = require('./config/database');
const setupAssociations = require('./config/associations');

// Setup associations between models
setupAssociations();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const supplierRoutes = require('./routes/supplier.js');
const bahanBakuRoutes = require('./routes/bahan-baku.js');
const purchaseOrderRoutes = require('./routes/purchase-order.js');
const poDetailRoutes = require('./routes/po-detail.js');
const resepRoutes = require('./routes/resep.js');
const resepDetailRoutes = require('./routes/resep-detail.js');
// const inventoryTransactionRoutes = require('./routes/inventory-transaction.js');

// Use routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/bahan-baku', bahanBakuRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/po-details', poDetailRoutes);
app.use('/api/resep', resepRoutes);
app.use('/api/resep-details', resepDetailRoutes);
// app.use('/api/inventory-transactions', inventoryTransactionRoutes);


// Rute untuk testing
app.get('/', (req, res) => {
  res.send('API auth service is running!');
});
app.get('/test', (req, res) => {
  res.json({ message: 'API Gateway is working' });
});
// Port
const PORT = process.env.PORT || 3005;

// Sync database dan start server
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();