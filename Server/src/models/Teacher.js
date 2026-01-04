mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/
    },
    phone: { 
        type: String,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);