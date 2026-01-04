/**
 * Database Seed Script
 * Run this to populate the database with initial data
 * 
 * Usage: node src/seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Group = require('./models/group');
const Timeslot = require('./models/Timeslot');
const Admin = require('./models/admin/AdminUser');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academy_smsm';

// Sample data
const subjects = [
    { name: 'Mathematics', isActive: true },
    { name: 'Physics', isActive: true },
    { name: 'Chemistry', isActive: true },
    { name: 'Biology', isActive: true },
    { name: 'English', isActive: true },
    { name: 'Arabic', isActive: true },
    { name: 'French', isActive: true },
    { name: 'German', isActive: true },
];

const teachers = [
    { name: 'Dr. Ahmed Hassan', email: 'ahmed@smsm.com', phone: '01000000001' },
    { name: 'Dr. Sara Mohamed', email: 'sara@smsm.com', phone: '01000000002' },
    { name: 'Mr. Khaled Ali', email: 'khaled@smsm.com', phone: '01000000003' },
    { name: 'Ms. Fatima Omar', email: 'fatima@smsm.com', phone: '01000000004' },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🧹 Clearing existing data...');
        await Subject.deleteMany({});
        await Teacher.deleteMany({});
        await Group.deleteMany({});
        await Timeslot.deleteMany({});

        // Seed Subjects
        console.log('📚 Seeding subjects...');
        const createdSubjects = await Subject.insertMany(subjects);
        console.log(`   Created ${createdSubjects.length} subjects`);

        // Seed Teachers
        console.log('👨‍🏫 Seeding teachers...');
        const createdTeachers = await Teacher.insertMany(teachers);
        console.log(`   Created ${createdTeachers.length} teachers`);

        // Seed Groups (one group per subject with random teacher)
        console.log('👥 Seeding groups...');
        const groups = createdSubjects.map((subject, index) => ({
            name: `${subject.name} - Group A`,
            subject: subject._id,
            teacher: createdTeachers[index % createdTeachers.length]._id,
            type: 'regular',
            level: 'intermediate',
            maxStudents: 20,
            currentStudents: 0,
        }));
        const createdGroups = await Group.insertMany(groups);
        console.log(`   Created ${createdGroups.length} groups`);

        // Seed Timeslots (sample timeslots for each group)
        console.log('🕐 Seeding timeslots...');
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        const times = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
        
        const timeslots = [];
        createdGroups.forEach((group, index) => {
            timeslots.push({
                group: group._id,
                day: days[index % days.length],
                startTime: times[index % times.length],
                endTime: times[(index + 1) % times.length],
                available: true,
            });
        });
        const createdTimeslots = await Timeslot.insertMany(timeslots);
        console.log(`   Created ${createdTimeslots.length} timeslots`);

        // Create default admin if not exists
        console.log('👤 Checking admin account...');
        const existingAdmin = await Admin.findOne({ email: 'admin@smsm.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Admin.create({
                name: 'Admin',
                email: 'admin@smsm.com',
                password: hashedPassword,
            });
            console.log('   Created admin account (admin@smsm.com / admin123)');
        } else {
            console.log('   Admin account already exists');
        }

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Summary:');
        console.log(`   📚 Subjects: ${createdSubjects.length}`);
        console.log(`   👨‍🏫 Teachers: ${createdTeachers.length}`);
        console.log(`   👥 Groups: ${createdGroups.length}`);
        console.log(`   🕐 Timeslots: ${createdTimeslots.length}`);
        console.log('\n📝 Admin login: admin@smsm.com / admin123\n');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();
