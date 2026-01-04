require('dotenv').config();

const connectDB = require('./config/db');
const Subject = require('./models/Subject');

const run = async () => {
    await connectDB();

    const subject = await Subject.create({ name: 'Mathematics' });
    console.log('Created Subject:', subject);

    const subjects = await Subject.find();
    console.log('All Subjects:', subjects);

    process.exit(0);
}

run();