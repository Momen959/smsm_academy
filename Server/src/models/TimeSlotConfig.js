// src/models/TimeSlotConfig.js
// Model for storing timeslot configuration (days and time periods)
const mongoose = require('mongoose');

// Schema for day configuration
const dayConfigSchema = new mongoose.Schema({
    // Short code (e.g., 'Sat', 'Sun')
    code: {
        type: String,
        required: true,
        unique: true
    },
    // Full English name
    nameEn: {
        type: String,
        required: true
    },
    // Full Arabic name
    nameAr: {
        type: String,
        required: true
    },
    // Display order (0 = first)
    sortOrder: {
        type: Number,
        default: 0
    },
    // Whether this day is available for scheduling
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Schema for time period configuration
const timePeriodConfigSchema = new mongoose.Schema({
    // Start time (HH:MM format)
    startTime: {
        type: String,
        required: true,
        match: /^\d{2}:\d{2}$/
    },
    // End time (HH:MM format)
    endTime: {
        type: String,
        required: true,
        match: /^\d{2}:\d{2}$/
    },
    // Display label (e.g., '8-10 AM')
    label: {
        type: String,
        required: true
    },
    // Arabic label
    labelAr: {
        type: String,
        default: ''
    },
    // Display order
    sortOrder: {
        type: Number,
        default: 0
    },
    // Whether this time period is available
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound unique index for time periods
timePeriodConfigSchema.index({ startTime: 1, endTime: 1 }, { unique: true });

// Static methods for DayConfig
dayConfigSchema.statics.getActiveDays = async function() {
    return this.find({ isActive: true })
        .sort({ sortOrder: 1 })
        .select('code nameEn nameAr');
};

// Static methods for TimePeriodConfig
timePeriodConfigSchema.statics.getActiveTimePeriods = async function() {
    return this.find({ isActive: true })
        .sort({ sortOrder: 1 })
        .select('startTime endTime label labelAr');
};

const DayConfig = mongoose.model('DayConfig', dayConfigSchema);
const TimePeriodConfig = mongoose.model('TimePeriodConfig', timePeriodConfigSchema);

module.exports = { DayConfig, TimePeriodConfig };
