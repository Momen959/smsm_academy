// src/seeds/seedConfigOptions.js
// Seed script to populate initial configuration options in the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ConfigOption = require('../models/ConfigOption');

const configOptions = [
    // Group Types
    { category: 'groupType', value: 'classroom', labelEn: 'Classroom', labelAr: 'فصل دراسي', sortOrder: 1 },
    { category: 'groupType', value: 'group', labelEn: 'Group', labelAr: 'مجموعة', sortOrder: 2 },
    { category: 'groupType', value: 'private', labelEn: 'Private', labelAr: 'خاص', sortOrder: 3 },

    // Group Levels
    { category: 'groupLevel', value: 'beginner', labelEn: 'Beginner', labelAr: 'مبتدئ', sortOrder: 1 },
    { category: 'groupLevel', value: 'intermediate', labelEn: 'Intermediate', labelAr: 'متوسط', sortOrder: 2 },
    { category: 'groupLevel', value: 'advanced', labelEn: 'Advanced', labelAr: 'متقدم', sortOrder: 3 },

    // Education Types
    { category: 'educationType', value: 'local', labelEn: 'Local', labelAr: 'محلي', sortOrder: 1 },
    { category: 'educationType', value: 'azhar', labelEn: 'Azhar', labelAr: 'أزهري', sortOrder: 2 },
    { category: 'educationType', value: 'national', labelEn: 'National', labelAr: 'وطني', sortOrder: 3 },
    { category: 'educationType', value: 'international', labelEn: 'International', labelAr: 'دولي', sortOrder: 4 },

    // Grades
    { category: 'grade', value: 'KG1', labelEn: 'KG 1', labelAr: 'تمهيدي 1', sortOrder: 1 },
    { category: 'grade', value: 'KG2', labelEn: 'KG 2', labelAr: 'تمهيدي 2', sortOrder: 2 },
    { category: 'grade', value: 'G1', labelEn: 'Grade 1', labelAr: 'الصف الأول', sortOrder: 3 },
    { category: 'grade', value: 'G2', labelEn: 'Grade 2', labelAr: 'الصف الثاني', sortOrder: 4 },
    { category: 'grade', value: 'G3', labelEn: 'Grade 3', labelAr: 'الصف الثالث', sortOrder: 5 },
    { category: 'grade', value: 'G4', labelEn: 'Grade 4', labelAr: 'الصف الرابع', sortOrder: 6 },
    { category: 'grade', value: 'G5', labelEn: 'Grade 5', labelAr: 'الصف الخامس', sortOrder: 7 },
    { category: 'grade', value: 'G6', labelEn: 'Grade 6', labelAr: 'الصف السادس', sortOrder: 8 },
    { category: 'grade', value: 'G7', labelEn: 'Grade 7', labelAr: 'الصف السابع', sortOrder: 9 },
    { category: 'grade', value: 'G8', labelEn: 'Grade 8', labelAr: 'الصف الثامن', sortOrder: 10 },
    { category: 'grade', value: 'G9', labelEn: 'Grade 9', labelAr: 'الصف التاسع', sortOrder: 11 },
    { category: 'grade', value: 'G10', labelEn: 'Grade 10', labelAr: 'الصف العاشر', sortOrder: 12 },
    { category: 'grade', value: 'G11', labelEn: 'Grade 11', labelAr: 'الصف الحادي عشر', sortOrder: 13 },
    { category: 'grade', value: 'G12', labelEn: 'Grade 12', labelAr: 'الصف الثاني عشر', sortOrder: 14 }
];

async function seedConfigOptions() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing config options (optional - comment out to preserve existing)
        await ConfigOption.deleteMany({});
        console.log('🗑️  Cleared existing config options');

        // Insert all config options
        const result = await ConfigOption.insertMany(configOptions);
        console.log(`✅ Inserted ${result.length} config options`);

        // Display summary
        const grouped = await ConfigOption.getAllGrouped();
        console.log('\n📋 Config Options Summary:');
        for (const [category, options] of Object.entries(grouped)) {
            console.log(`   ${category}: ${options.length} options`);
        }

        console.log('\n✅ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the seed
seedConfigOptions();
