// src/seeds/seedAdmin.js
// Creates the default admin user

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const AdminUser = require('../models/admin/AdminUser');
const { hashPassword } = require('../utils/password');

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('⏭️  Admin user already exists');
        } else {
            // Create default admin user
            const hashedPassword = await hashPassword('admin123');
            
            const admin = new AdminUser({
                username: 'admin',
                password: hashedPassword,
                role: 'superadmin'
            });
            
            await admin.save();
            console.log('✅ Admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        }

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

seedAdmin();
