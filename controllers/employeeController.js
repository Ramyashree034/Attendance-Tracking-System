const User = require('../models/User');
const Attendance = require('../models/Attendance');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password");
    
    // Add today's attendance
    const today = new Date();
    const todayStart = new Date(today.setHours(0,0,0,0));
    const todayEnd = new Date(today.setHours(23,59,59,999));

    const data = await Promise.all(employees.map(async (emp) => {
      const att = await Attendance.findOne({ user: emp._id, date: { $gte: todayStart, $lte: todayEnd } });
      return {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        todayStatus: att ? att.status : 'absent',
        checkIn: att?.checkIn,
        checkOut: att?.checkOut,
        hoursWorked: att?.hoursWorked
      };
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const depts = await User.aggregate([
      { $match: { role: "employee" } },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    // Add colors for chart
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const departments = depts.map((d, i) => ({
      name: d._id,
      value: d.count,
      color: colors[i % colors.length]
    }));

    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
