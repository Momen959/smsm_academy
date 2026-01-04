// src/routes/user/userRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
const subjectController = require('../../controllers/user/subject');
const optionsController = require('../../controllers/user/options');
const timeslotController = require('../../controllers/user/timeslot');
const upload = require('../../middlewares/upload');

router.post('/applications', applicationController.createDraft);

router.put('/applications/:id/timeslot', applicationController.selectTimeslot);

router.put(
  '/applications/:id/submit',
  upload.single('paymentProof'),
  applicationController.submitApplication
);

router.post('/applications/submit', upload.single('paymentProof'), applicationController.createAndSubmit);

router.get('/subjects', subjectController.getActiveSubjects);

router.get('/options', optionsController.getOptions);

router.get('/timeslots', timeslotController.getTimeslots);

router.get('/timeslots/grid', timeslotController.getTimeslotGrid);

module.exports = router;

