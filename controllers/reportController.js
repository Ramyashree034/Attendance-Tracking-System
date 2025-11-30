const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.monthlyTrend = async (req, res) => {
  const data = await Attendance.aggregate([
    { $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        totalPresent: { $sum: { $cond: [{ $eq: ["$status","present"]}, 1, 0] } },
        totalDays: { $sum: 1 }
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const formatted = data.map(d => ({
    month: `${d._id.month}-${d._id.year}`,
    attendance: ((d.totalPresent/d.totalDays)*100).toFixed(1),
    target: 95
  }));

  res.json(formatted);
};

exports.quickStats = async (req, res) => {
  const totalPresent = await Attendance.countDocuments({ status: 'present' });
  const totalAbsent = await Attendance.countDocuments({ status: 'absent' });
  const totalLate = await Attendance.countDocuments({ status: 'late' });

  const totalDays = totalPresent + totalAbsent + totalLate;
  const avgAttendance = totalDays ? (totalPresent / totalDays * 100) : 0;

  res.json({ avgAttendance, totalPresent, totalAbsent, totalLate });
};
