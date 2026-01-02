const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superadmin', 'staff'],
    default: 'superadmin'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminSchema);
