const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  myHistory,
  todaySummary,
  weeklyTrend,
  monthlyAttendance,
} = require('../controllers/attendanceController');

// Attendance routes
router.post('/checkin', authMiddleware, checkIn);
router.post('/checkout', authMiddleware, checkOut);
router.get('/history', authMiddleware, myHistory);
router.get('/summary', authMiddleware, todaySummary); // /attendance/summary
router.get('/today', authMiddleware, todaySummary);   // /attendance/today
router.get('/weekly', authMiddleware, weeklyTrend);   // /attendance/weekly
router.get('/monthly', authMiddleware, monthlyAttendance); // /attendance/monthly

module.exports = router;
