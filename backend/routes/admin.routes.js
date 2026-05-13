const express = require('express');
const router = express.Router();
const { getUsers, getTransactions, getAccounts, getMetrics } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/users', protect, adminOnly, getUsers);
router.get('/transactions', protect, adminOnly, getTransactions);
router.get('/accounts', protect, adminOnly, getAccounts);
router.get('/metrics', protect, adminOnly, getMetrics);

module.exports = router;
