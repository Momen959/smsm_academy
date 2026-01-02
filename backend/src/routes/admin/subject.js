const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/admin/subject');
const adminAuth = require('../../middlewares/adminAuth'); // JWT admin auth middleware

router.post('/', adminAuth, subjectController.createSubject);
router.get('/', adminAuth, subjectController.getSubjects);
router.put('/:id', adminAuth, subjectController.updateSubject);
router.delete('/:id', adminAuth, subjectController.deleteSubject);

module.exports = router;
