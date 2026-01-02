const express = require('express');

const router = express.Router();

const Subject = require('../../controllers/subject');

router.get('/', Subject.getActiveSubjects);