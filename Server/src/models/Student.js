const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        type: String,
        required: true,
        match: /^(?:\+20|0)?1[0125]\d{8}$/
    },
    grade: {
        type: String,
        default: ''
    },
    educationType: {
        type: String,
        default: 'national'
    }

}, { timestamps: true });

studentSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Studentinfo', studentSchema);