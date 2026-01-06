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
        required: true,
        match: /^(?:\+20|0)?1[0125]\d{8}$/
    }

}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);