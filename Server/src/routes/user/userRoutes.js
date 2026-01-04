// src/routes/user/userRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
const subjectController = require('../../controllers/user/subject');
const optionsController = require('../../controllers/user/options');
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

// Combined endpoint - creates application with all data including file
router.post('/applications/submit', upload.single('paymentProof'), applicationController.createAndSubmit);

// 4️⃣ Get active subjects
router.get('/subjects', subjectController.getActiveSubjects);

// 5️⃣ Get options for dropdowns (group types, education types, grades)
router.get('/options', optionsController.getOptions);

module.exports = router;
