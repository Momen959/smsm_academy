const express = require('express');
const router = express.Router();
const teacherController = require('../../../controllers/admin/teacher');
const { verifyAdmin } = require('../../../middlewares/auth');

// Protect all routes
router.use(verifyAdmin);

router.post('/', teacherController.createTeacher);
router.get('/', teacherController.getTeachers);
router.get('/:id', teacherController.getTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
