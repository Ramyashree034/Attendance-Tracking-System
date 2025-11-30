const express = require('express');
const router = express.Router();
const { getAllEmployees, getDepartments } = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllEmployees);
router.get('/departments', authMiddleware, getDepartments);

module.exports = router;
