const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
    subject: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject', required: true 
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
}, { timestamps: true });


module.exports = mongoose.model('Group', groupSchema);