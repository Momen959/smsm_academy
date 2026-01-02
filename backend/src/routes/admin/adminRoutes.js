const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/admin/subject');
const groupController = require('../../controllers/admin/group');
const teacherController = require('../../controllers/admin/teacher');
const timeslotController = require('../../controllers/admin/timeslot');
const applicationController = require('../../controllers/admin/application');
const authController = require('../../controllers/admin/adminAuth');
const authMiddleware = require('../../middlewares/verifyAdmin');

// Auth
router.post('/login', authController.login);

// Subjects
router.post('/subjects', authMiddleware, subjectController.createSubject);
router.get('/subjects', authMiddleware, subjectController.getSubjects);
router.put('/subjects/:id', authMiddleware, subjectController.updateSubject);
router.delete('/subjects/:id', authMiddleware, subjectController.deleteSubject);

// Groups
router.post('/groups', authMiddleware, groupController.createGroup);
router.get('/groups', authMiddleware, groupController.getGroups);
router.put('/groups/:id', authMiddleware, groupController.updateGroup);
router.delete('/groups/:id', authMiddleware, groupController.deleteGroup);

// Teachers
router.post('/teachers', authMiddleware, teacherController.createTeacher);
router.get('/teachers', authMiddleware, teacherController.getTeachers);
router.put('/teachers/:id', authMiddleware, teacherController.updateTeacher);
router.delete('/teachers/:id', authMiddleware, teacherController.deleteTeacher);

// Timeslots
router.post('/timeslots', authMiddleware, timeslotController.createTimeslot);
router.get('/timeslots', authMiddleware, timeslotController.getTimeslots);
router.put('/timeslots/:id', authMiddleware, timeslotController.updateTimeslot);
router.delete('/timeslots/:id', authMiddleware, timeslotController.deleteTimeslot);

// Applications
router.put('/applications/:id/status', authMiddleware, applicationController.reviewApplication);
router.put('/applications/:id/timeslot', authMiddleware, applicationController.changeTimeslot);

module.exports = router;