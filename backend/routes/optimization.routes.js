const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimization.controller');
// const { protect, admin } = require('../middleware/auth'); // Assuming these exist

router.get('/analytics', optimizationController.getAnalytics);
router.get('/fraud', optimizationController.getFraudAnalysis);
router.get('/autocomplete', optimizationController.getAutocomplete);
router.get('/sort', optimizationController.getSortedTransactions);

module.exports = router;
