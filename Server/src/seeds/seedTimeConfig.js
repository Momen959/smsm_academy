// src/seeds/seedTimeConfig.js
// Seed script to populate day and time period configuration
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { DayConfig, TimePeriodConfig } = require('../models/TimeSlotConfig');

const days = [
    { code: 'Sat', nameEn: 'Saturday', nameAr: 'السبت', sortOrder: 0 },
    { code: 'Sun', nameEn: 'Sunday', nameAr: 'الأحد', sortOrder: 1 },
    { code: 'Mon', nameEn: 'Monday', nameAr: 'الإثنين', sortOrder: 2 },
    { code: 'Tue', nameEn: 'Tuesday', nameAr: 'الثلاثاء', sortOrder: 3 },
    { code: 'Wed', nameEn: 'Wednesday', nameAr: 'الأربعاء', sortOrder: 4 },
    { code: 'Thu', nameEn: 'Thursday', nameAr: 'الخميس', sortOrder: 5 }
];

const timePeriods = [
    { startTime: '08:00', endTime: '10:00', label: '8-10 AM', labelAr: '8-10 صباحاً', sortOrder: 0 },
    { startTime: '10:00', endTime: '12:00', label: '10-12 PM', labelAr: '10-12 ظهراً', sortOrder: 1 },
    { startTime: '12:00', endTime: '14:00', label: '12-2 PM', labelAr: '12-2 مساءً', sortOrder: 2 },
    { startTime: '14:00', endTime: '16:00', label: '2-4 PM', labelAr: '2-4 مساءً', sortOrder: 3 },
    { startTime: '16:00', endTime: '18:00', label: '4-6 PM', labelAr: '4-6 مساءً', sortOrder: 4 },
    { startTime: '18:00', endTime: '20:00', label: '6-8 PM', labelAr: '6-8 مساءً', sortOrder: 5 }
];

async function seedTimeConfig() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing config
        await DayConfig.deleteMany({});
        await TimePeriodConfig.deleteMany({});
        console.log('🗑️  Cleared existing time configuration');

        // Insert days
        const daysResult = await DayConfig.insertMany(days);
        console.log(`✅ Inserted ${daysResult.length} day configurations`);

        // Insert time periods
        const timesResult = await TimePeriodConfig.insertMany(timePeriods);
        console.log(`✅ Inserted ${timesResult.length} time period configurations`);

        console.log('\n✅ Time configuration seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the seed
seedTimeConfig();
