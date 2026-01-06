const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', 
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