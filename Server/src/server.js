const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;


connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

