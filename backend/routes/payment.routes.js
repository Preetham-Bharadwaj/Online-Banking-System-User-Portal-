const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/upi-transfer', protect, paymentController.upiTransfer);
router.post('/setup-pin', protect, paymentController.setupPin);
router.get('/qr-details', protect, paymentController.getQrDetails);

module.exports = router;
