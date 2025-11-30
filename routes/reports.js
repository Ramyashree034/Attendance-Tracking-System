const express = require('express');
const router = express.Router();
const { monthlyTrend, quickStats } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/monthly-trend', authMiddleware, monthlyTrend);
router.get('/quick-stats', authMiddleware, quickStats);

module.exports = router;
