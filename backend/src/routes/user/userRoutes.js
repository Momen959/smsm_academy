const express = require('express');
const router = express.Router();
const applicationController = require('../../controllers/user/application');
const subjectController = require('../../controllers/user/subject');

// applications
router.post('/applications', applicationController.createDraft);
router.post('/applications', applicationController.selectTimeslot);
router.post('/applications/:id', applicationController.submitApplication);


// subjects
router.get('/subjects', subjectController.getActiveSubjects);

module.exports = router;
