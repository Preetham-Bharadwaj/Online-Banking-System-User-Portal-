const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Example protected route
router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

module.exports = router;
