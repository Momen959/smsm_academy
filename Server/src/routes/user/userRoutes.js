const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
const subjectController = require('../../controllers/user/subject');
const optionsController = require('../../controllers/user/options');
const upload = require('../../middlewares/upload');

// applications
router.post('/applications', applicationController.createDraft);
router.put('/applications/:id/timeslot', applicationController.selectTimeslot);
router.post('/applications/:id', upload.single('paymentProof'), applicationController.submitApplication);

// New combined endpoint - creates application with all data including file
router.post('/applications/submit', upload.single('paymentProof'), applicationController.createAndSubmit);

// subjects
router.get('/subjects', subjectController.getActiveSubjects);

// options for dropdowns (group types, education types, grades)
router.get('/options', optionsController.getOptions);

module.exports = router;

