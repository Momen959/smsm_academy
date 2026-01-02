const bcrypt = require('bcrypt');
const AdminUser = require('./models/admin/AdminUser');
const db = require('./config/db');

db().then(() => console.log('Database connected')).catch(err => console.error('Database connection error:', err));

(async () => {
    const hashed = await bcrypt.hash('Password123', 10);
    const admin = new AdminUser({
        username: 'superadmin',
        password: hashed,
        role: 'superadmin'
    });
    await admin.save();
    console.log('Admin created');
})();
