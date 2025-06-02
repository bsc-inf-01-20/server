require('dotenv').config();
const express = require('express');
const app = express();
const apiRoutes = require('./routes/apiRoutes');
const middleware = require('./config/middleware');
const { swaggerUi, swaggerSpec } = require('./swagger');

// Initialize middleware
middleware(app);

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;