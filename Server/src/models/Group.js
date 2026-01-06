const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject',
        required: true 
    },

    // 🔹 NEW
    grade: {
        type: String,
        enum: [
            'KG1','KG2','G1','G2','G3','G4','G5',
            'G6','G7','G8','G9','G10','G11','G12'
        ],
        required: true
    },

    // 🔹 NEW
    educationType: {
        type: String,
        enum: ['local', 'azhar', 'national', 'international'],
        required: true
    },

    type: { 
        type: String,
        enum: ['classroom', 'group', 'private'],
        required: true 
    },

    capacity: { 
        type: Number,
        required: true 
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    educationType: {
        type: String,
        enum: ['local', 'azhar', 'national', 'international'],
        default: 'national'
    },
    grade: {
        type: String,
        default: 'G1'
    }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
