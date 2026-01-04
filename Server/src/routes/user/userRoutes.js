// src/routes/user/application.js
const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
const subjectController = require('../../controllers/user/subject')
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


module.exports = router;
