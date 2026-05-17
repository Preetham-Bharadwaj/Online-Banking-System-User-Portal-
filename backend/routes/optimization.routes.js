const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimization.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/analytics', protect, optimizationController.getAnalytics);
router.get('/fraud', protect, optimizationController.getFraudAnalysis);
router.get('/autocomplete', protect, optimizationController.getAutocomplete);
router.get('/sort', protect, optimizationController.getSortedTransactions);

module.exports = router;
