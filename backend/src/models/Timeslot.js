const mongoose = require('mongoose');

const timeslotSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  maxCapacity: {
    type: Number,
    required: true
  },
  registeredStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Studentinfo'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Timeslot', timeslotSchema);
