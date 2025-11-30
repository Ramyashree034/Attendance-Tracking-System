const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  hoursWorked: { type: Number },
  status: { type: String, enum: ['present', 'absent', 'late', 'halfday'], required: true },
  reason: { type: String } // optional for absent
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
