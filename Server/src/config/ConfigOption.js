// src/models/ConfigOption.js
// Model for storing all configuration options (dropdowns) in the database
const mongoose = require('mongoose');

const configOptionSchema = new mongoose.Schema({
    // Category of the option (groupType, groupLevel, educationType, grade)
    category: {
        type: String,
        enum: ['groupType', 'groupLevel', 'educationType', 'grade'],
        required: true
    },
    // Internal value used in other models
    value: {
        type: String,
        required: true
    },
    // English label for display
    labelEn: {
        type: String,
        required: true
    },
    // Arabic label for display
    labelAr: {
        type: String,
        required: true
    },
    // Order for display (lower comes first)
    sortOrder: {
        type: Number,
        default: 0
    },
    // Whether this option is currently active/visible
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index for unique category-value pairs
configOptionSchema.index({ category: 1, value: 1 }, { unique: true });

// Static method to get options by category
configOptionSchema.statics.getByCategory = async function(category) {
    return this.find({ category, isActive: true })
        .sort({ sortOrder: 1, labelEn: 1 })
        .select('value labelEn labelAr');
};

// Static method to get all options grouped by category
configOptionSchema.statics.getAllGrouped = async function() {
    const options = await this.find({ isActive: true })
        .sort({ sortOrder: 1, labelEn: 1 })
        .select('category value labelEn labelAr');
    
    return options.reduce((grouped, opt) => {
        if (!grouped[opt.category]) {
            grouped[opt.category] = [];
        }
        grouped[opt.category].push({
            value: opt.value,
            labelEn: opt.labelEn,
            labelAr: opt.labelAr
        });
        return grouped;
    }, {});
};

module.exports = mongoose.model('ConfigOption', configOptionSchema);
