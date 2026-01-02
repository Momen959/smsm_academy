const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/application');
const adminAuth = require('../../middlewares/adminAuth');

router.use(adminAuth);

// approve / reject
router.put('/:id/status', controller.updateStatus);

// change timeslot
router.put('/:id/timeslot', controller.changeTimeslot);

module.exports = router;
