const express = require('express');
const router = express.Router();

// Return static list of departments
router.get('/', (req, res) => {
  res.json({
    departments: [
      { _id: 'eng', name: 'Engineering' },
      { _id: 'design', name: 'Design' },
      { _id: 'marketing', name: 'Marketing' },
      { _id: 'sales', name: 'Sales' },
      { _id: 'hr', name: 'HR' },
      { _id: 'finance', name: 'Finance' },
    ]
  });
});

module.exports = router;
