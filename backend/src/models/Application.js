const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Studentinfo',
    required: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },

  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },

  timeslot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timeslot',
    default: null
  },

  status: {
    type: String,
    enum: [
      'Draft',
      'TimeslotSelected',
      'Submitted',
      'Accepted',
      'Rejected'
    ],
    default: 'Draft'
  }

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
