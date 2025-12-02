require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// MongoDB Connection
// ========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ========================
// API Routes
// ========================
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));

// ========================
// FRONTEND (dist folder)
// ========================
const distPath = path.join(__dirname, 'dist');

// Serve static files
app.use(express.static(distPath));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
