const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getTransactions,
  getAnalytics,
  getBills,
  getNotifications,
  initiateTransfer,
  getBeneficiaries,
  addBeneficiary,
  updateBudget,
  deposit
} = require('../controllers/banking.controller');
const cardController = require('../controllers/card.controller');
const { protect } = require('../middleware/auth.middleware');

// --- Global Data ---
router.get('/dashboard', protect, getDashboardData);
router.get('/transactions/me', protect, getTransactions);
router.get('/analytics/me', protect, getAnalytics);
router.get('/bills/me', protect, getBills);
router.get('/notifications/me', protect, getNotifications);

// --- Transfers & Payments ---
router.post('/transfer', protect, initiateTransfer);
router.post('/deposit', protect, deposit);
router.get('/beneficiaries', protect, getBeneficiaries);
router.post('/beneficiaries', protect, addBeneficiary);

// --- Budgets ---
router.post('/budgets', protect, updateBudget);

// --- Card Management ---
router.get('/cards', protect, cardController.getCards);
router.patch('/cards/:cardId/status', protect, cardController.updateCardStatus);
router.patch('/cards/:cardId/limits', protect, cardController.updateCardLimits);
router.patch('/cards/:cardId/pin', protect, cardController.changeCardPin);

module.exports = router;
