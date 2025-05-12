require('dotenv').config();
const express = require('express');
const app = express();
const apiRoutes = require('./routes/apiRoutes');
const middleware = require('./config/middleware');

// Initialize middleware
middleware(app);

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export the app for Vercel (DO NOT use app.listen for Vercel)
module.exports = app;
