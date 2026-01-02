const express = require('express');
const router = express.Router();
const timeslotController = require('../../../controllers/admin/timeslot');
const { verifyAdmin } = require('../../../middlewares/auth');

// Protect all routes
router.use(verifyAdmin);

router.post('/', timeslotController.createTimeslot);
router.get('/', timeslotController.getTimeslots);
router.get('/:id', timeslotController.getTimeslot);
router.put('/:id', timeslotController.updateTimeslot);
router.delete('/:id', timeslotController.deleteTimeslot);

module.exports = router;
