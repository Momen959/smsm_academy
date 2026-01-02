// src/routes/user/application.js
const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload');
const controller = require('../../controllers/user/application');

router.post('/', controller.createDraft);
router.put('/:id/timeslot', controller.selectTimeslot);
router.post('/:id/submit', upload.single('payment'), controller.submitApplication);

module.exports = router;
