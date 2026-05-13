const express = require('express');
const router = express.Router();
const { register, login, getMe, searchUsers, getAllUsers } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/search', protect, searchUsers);
router.get('/all-users', protect, getAllUsers);



module.exports = router;
