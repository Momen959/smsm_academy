const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// middleware
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

module.exports = app;