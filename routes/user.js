const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route
router.get('/me', authMiddleware, getMe);

module.exports = router;
