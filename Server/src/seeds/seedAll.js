// src/seeds/seedAll.js
// Master seed script - runs all seed scripts
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ConfigOption = require('../models/ConfigOption');
const { DayConfig, TimePeriodConfig } = require('../models/TimeSlotConfig');
const Subject = require('../models/Subject');
const Group = require('../models/Group');
const Teacher = require('../models/Teacher');
const Timeslot = require('../models/Timeslot');

// Configuration Options
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

// Day Configuration
const days = [
    { code: 'Sat', nameEn: 'Saturday', nameAr: 'السبت', sortOrder: 0 },
    { code: 'Sun', nameEn: 'Sunday', nameAr: 'الأحد', sortOrder: 1 },
    { code: 'Mon', nameEn: 'Monday', nameAr: 'الإثنين', sortOrder: 2 },
    { code: 'Tue', nameEn: 'Tuesday', nameAr: 'الثلاثاء', sortOrder: 3 },
    { code: 'Wed', nameEn: 'Wednesday', nameAr: 'الأربعاء', sortOrder: 4 },
    { code: 'Thu', nameEn: 'Thursday', nameAr: 'الخميس', sortOrder: 5 }
];

// Time Period Configuration
const timePeriods = [
    { startTime: '08:00', endTime: '10:00', label: '8-10 AM', labelAr: '8-10 صباحاً', sortOrder: 0 },
    { startTime: '10:00', endTime: '12:00', label: '10-12 PM', labelAr: '10-12 ظهراً', sortOrder: 1 },
    { startTime: '12:00', endTime: '14:00', label: '12-2 PM', labelAr: '12-2 مساءً', sortOrder: 2 },
    { startTime: '14:00', endTime: '16:00', label: '2-4 PM', labelAr: '2-4 مساءً', sortOrder: 3 },
    { startTime: '16:00', endTime: '18:00', label: '4-6 PM', labelAr: '4-6 مساءً', sortOrder: 4 },
    { startTime: '18:00', endTime: '20:00', label: '6-8 PM', labelAr: '6-8 مساءً', sortOrder: 5 }
];

// Sample Subjects
const subjects = [
    { name: 'Mathematics', isActive: true },
    { name: 'Physics', isActive: true },
    { name: 'Chemistry', isActive: true },
    { name: 'Biology', isActive: true },
    { name: 'English', isActive: true },
    { name: 'Arabic', isActive: true }
];

// Sample Teachers
const teachers = [
    { name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@smsm.academy' },
    { name: 'Prof. Sarah Mohamed', email: 'sarah.mohamed@smsm.academy' },
    { name: 'Mr. Youssef Ali', email: 'youssef.ali@smsm.academy' },
    { name: 'Ms. Fatima Nour', email: 'fatima.nour@smsm.academy' },
    { name: 'Dr. Omar Ibrahim', email: 'omar.ibrahim@smsm.academy' }
];

async function seedAll() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Seed Config Options
        console.log('📋 Seeding Config Options...');
        await ConfigOption.deleteMany({});
        const configResult = await ConfigOption.insertMany(configOptions);
        console.log(`   ✅ Inserted ${configResult.length} config options`);

        // 2. Seed Day Configuration
        console.log('\n📅 Seeding Day Configuration...');
        await DayConfig.deleteMany({});
        const daysResult = await DayConfig.insertMany(days);
        console.log(`   ✅ Inserted ${daysResult.length} day configurations`);

        // 3. Seed Time Period Configuration
        console.log('\n⏰ Seeding Time Period Configuration...');
        await TimePeriodConfig.deleteMany({});
        const timesResult = await TimePeriodConfig.insertMany(timePeriods);
        console.log(`   ✅ Inserted ${timesResult.length} time period configurations`);

        // 4. Seed Subjects (if empty)
        console.log('\n📚 Seeding Subjects...');
        const existingSubjects = await Subject.countDocuments();
        if (existingSubjects === 0) {
            const subjectsResult = await Subject.insertMany(subjects);
            console.log(`   ✅ Inserted ${subjectsResult.length} subjects`);
        } else {
            console.log(`   ⏭️  Skipped - ${existingSubjects} subjects already exist`);
        }

        // 5. Seed Teachers (if empty)
        console.log('\n👨‍🏫 Seeding Teachers...');
        const existingTeachers = await Teacher.countDocuments();
        if (existingTeachers === 0) {
            const teachersResult = await Teacher.insertMany(teachers);
            console.log(`   ✅ Inserted ${teachersResult.length} teachers`);
        } else {
            console.log(`   ⏭️  Skipped - ${existingTeachers} teachers already exist`);
        }

        // 6. Seed Groups (if empty)
        console.log('\n👥 Seeding Groups...');
        const existingGroups = await Group.countDocuments();
        if (existingGroups === 0) {
            const allSubjects = await Subject.find({});
            const groupTypes = ['classroom', 'group', 'private'];
            const groups = [];
            
            allSubjects.forEach(subject => {
                groupTypes.forEach(type => {
                    groups.push({
                        subject: subject._id,
                        type,
                        capacity: type === 'private' ? 5 : type === 'group' ? 10 : 25
                    });
                });
            });
            
            const groupsResult = await Group.insertMany(groups);
            console.log(`   ✅ Inserted ${groupsResult.length} groups`);
        } else {
            console.log(`   ⏭️  Skipped - ${existingGroups} groups already exist`);
        }

        // 7. Seed Sample Timeslots (if empty)
        console.log('\n📆 Seeding Sample Timeslots...');
        const existingTimeslots = await Timeslot.countDocuments();
        if (existingTimeslots === 0) {
            const allGroups = await Group.find({}).limit(6);
            const allTeachers = await Teacher.find({});
            const timeslots = [];
            
            // Create a base date (next Saturday)
            const today = new Date();
            const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
            const nextSaturday = new Date(today);
            nextSaturday.setDate(today.getDate() + daysUntilSaturday);
            
            allGroups.forEach((group, index) => {
                const teacher = allTeachers[index % allTeachers.length];
                const dayOffset = index % 6; // Spread across different days
                const timePeriodIndex = index % timePeriods.length;
                
                const slotDate = new Date(nextSaturday);
                slotDate.setDate(slotDate.getDate() + dayOffset);
                
                const [startHour, startMin] = timePeriods[timePeriodIndex].startTime.split(':').map(Number);
                const [endHour, endMin] = timePeriods[timePeriodIndex].endTime.split(':').map(Number);
                
                const startTime = new Date(slotDate);
                startTime.setHours(startHour, startMin, 0, 0);
                
                const endTime = new Date(slotDate);
                endTime.setHours(endHour, endMin, 0, 0);
                
                timeslots.push({
                    teacher: teacher._id,
                    group: group._id,
                    startTime,
                    endTime,
                    maxCapacity: group.capacity,
                    registeredStudents: []
                });
            });
            
            const timeslotsResult = await Timeslot.insertMany(timeslots);
            console.log(`   ✅ Inserted ${timeslotsResult.length} sample timeslots`);
        } else {
            console.log(`   ⏭️  Skipped - ${existingTimeslots} timeslots already exist`);
        }

        // Summary
        console.log('\n' + '═'.repeat(50));
        console.log('✅ ALL SEEDS COMPLETED SUCCESSFULLY!');
        console.log('═'.repeat(50));
        console.log('\nDatabase now contains:');
        console.log(`   • ${await ConfigOption.countDocuments()} config options`);
        console.log(`   • ${await DayConfig.countDocuments()} day configurations`);
        console.log(`   • ${await TimePeriodConfig.countDocuments()} time period configurations`);
        console.log(`   • ${await Subject.countDocuments()} subjects`);
        console.log(`   • ${await Teacher.countDocuments()} teachers`);
        console.log(`   • ${await Group.countDocuments()} groups`);
        console.log(`   • ${await Timeslot.countDocuments()} timeslots`);

    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the seed
seedAll();
