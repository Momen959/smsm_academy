const express = require('express');
const path = require('path');

const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
const adminRoutes = require('./routes/admin/adminRoutes');
const userRoutes = require('./routes/user/userRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Fallback
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
