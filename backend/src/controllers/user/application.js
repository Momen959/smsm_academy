// src/controllers/user/application.js
const Application = require('../../models/Application');

exports.createDraft = async (req, res) => {
    const { student, group } = req.body;

    const app = await Application.create({
        student,
        group
    });

    res.status(201).json(app);
};

exports.selectTimeslot = async (req, res) => {
    const { timeslot } = req.body;

    const app = await Application.findByIdAndUpdate(
        req.params.id,
        { timeslot, status: 'ScheduleSelected' },
        { new: true }
    );

    res.json(app);
};

exports.submitApplication = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Payment proof required' });
    }

    const app = await Application.findByIdAndUpdate(
        req.params.id,
        {
            paymentProof: req.file.path,
            status: 'Pending'
        },
        { new: true }
    );

    res.json(app);
};
