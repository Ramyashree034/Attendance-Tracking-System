const User = require('../models/User');

// List departments (can be used separately if needed)
exports.listDepartments = async (req, res) => {
  try {
    const departments = await User.distinct("department");
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
