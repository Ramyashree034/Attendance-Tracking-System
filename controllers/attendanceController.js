const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Parser } = require('json2csv');

// =====================
// Check-in
// =====================
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware should set req.user
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const existing = await Attendance.findOne({ user: userId, date: { $gte: start, $lte: end } });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });

    const attendance = new Attendance({ user: userId, date: new Date(), status: 'present', checkIn: new Date() });
    await attendance.save();

    res.json({ message: 'Checked in successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================
// Check-out
// =====================
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const attendance = await Attendance.findOne({ user: userId, date: { $gte: start, $lte: end } });
    if (!attendance) return res.status(400).json({ message: 'No check-in found today' });
    if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out today' });

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================
// My attendance history
// =====================
exports.myHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Attendance.find({ user: userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================
// Today's summary
// =====================
exports.todaySummary = async (req, res) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const present = await Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'present' });
  const absent = await Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'absent' });
  const late = await Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'late' });

  res.json({ present, absent, late });
};

// =====================
// Weekly attendance trend
// =====================
exports.weeklyTrend = async (req, res) => {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - 6));
  const lastDay = new Date(today.setHours(23, 59, 59, 999));

  const data = await Attendance.aggregate([
    { $match: { date: { $gte: firstDay, $lte: lastDay } } },
    {
      $group: {
        _id: { $dayOfWeek: '$date' },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
      },
    },
  ]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatted = data.map((d) => ({
    day: dayNames[d._id - 1],
    present: d.present,
    absent: d.absent,
    late: d.late,
  }));

  res.json(formatted);
};

// =====================
// Today's absent & late employees
// =====================
exports.todayAbsentLate = async (req, res) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const absentAtt = await Attendance.find({ date: { $gte: start, $lte: end }, status: 'absent' }).populate('user', 'name department');
  const lateAtt = await Attendance.find({ date: { $gte: start, $lte: end }, status: 'late' }).populate('user', 'name department checkIn');

  const absent = absentAtt.map((a) => ({ id: a.user._id, name: a.user.name, department: a.user.department, reason: a.reason || '' }));
  const late = lateAtt.map((a) => {
    const delayHours = a.checkIn ? ((new Date(`1970-01-01T${a.checkIn}`) - new Date('1970-01-01T09:00')) / 3600000).toFixed(1) : '0';
    return { id: a.user._id, name: a.user.name, department: a.user.department, checkIn: a.checkIn, delay: delayHours + 'h' };
  });

  res.json({ absent, late });
};

// =====================
// Monthly attendance for calendar
// =====================
exports.monthlyAttendance = async (req, res) => {
  const { year, month } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const data = await Attendance.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dayOfMonth: '$date' },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);

  const result = [];
  for (let i = 1; i <= end.getDate(); i++) {
    const day = data.find((d) => d._id === i);
    result.push({
      date: i,
      present: day?.present || 0,
      absent: day?.absent || 0,
      late: day?.late || 0,
      total: day?.total || 0,
    });
  }

  res.json(result);
};
