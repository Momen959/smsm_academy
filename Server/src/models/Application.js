// src/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Studentinfo',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
        // Not required - might be null for some applications
    },
    timeslot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timeslot'
    },

    status: {
        type: String,
        enum: [
            'Draft',
            'ScheduleSelected',
            'Submitted',
            'Pending',
            'Accepted',
            'Rejected'
        ],
        default: 'Draft'
    },

    // Payment
    paymentProof: {
        type: String // file path
    },

    adminModified: {
        type: Boolean,
        default: false
    },
    adminNotes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
