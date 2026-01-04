// src/routes/user/application.js
const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
<<<<<<< HEAD
const subjectController = require('../../controllers/user/subject');
const optionsController = require('../../controllers/user/options');
=======
const subjectController = require('../../controllers/user/subject')
>>>>>>> cdfb1c073f1c496d9b9435f5a605b477657820d4
const upload = require('../../middlewares/upload');

// 1️⃣ Create draft application
router.post('/applications', applicationController.createDraft);

// 2️⃣ Select timeslot
router.put('/applications/:id/timeslot', applicationController.selectTimeslot);

// 3️⃣ Submit application with payment proof
router.put(
  '/applications/:id/submit',
  upload.single('paymentProof'),
  applicationController.submitApplication
);

// 4️⃣ Get active subjects
router.get('/subjects', subjectController.getActiveSubjects);

<<<<<<< HEAD
// options for dropdowns (group types, education types, grades)
router.get('/options', optionsController.getOptions);
=======
>>>>>>> cdfb1c073f1c496d9b9435f5a605b477657820d4

module.exports = router;

