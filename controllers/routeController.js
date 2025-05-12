const { saveBulkRoutes } = require('../services/routeService');

const saveBulkRoutesController = async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "Expected an array of routes" });
  }

  try {
    const savedRoutes = await saveBulkRoutes(req.body);
    res.status(201).json(savedRoutes);
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(error.status || 500).json({ 
      error: error.message,
      failures: error.failures || []
    });
  }
};

module.exports = {
  saveBulkRoutesController
};