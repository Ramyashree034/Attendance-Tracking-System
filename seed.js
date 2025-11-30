const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_system');

  const hashedPassword = await bcrypt.hash('123456', 10);

  await User.create([
    { name: 'Manager', email: 'manager@company.com', password: hashedPassword, role: 'manager', employeeId: 'EMP000', department: 'HR' },
    { name: 'Alice', email: 'alice@company.com', password: hashedPassword, role: 'employee', employeeId: 'EMP001', department: 'HR' },
    { name: 'Bob', email: 'bob@company.com', password: hashedPassword, role: 'employee', employeeId: 'EMP002', department: 'HR' }
  ]);

  console.log('Seed data added');
  mongoose.connection.close();
};

seed();
