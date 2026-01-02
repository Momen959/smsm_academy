// src/controllers/admin/application.js
const Application = require('../../models/Application');

exports.getPendingApplications = async (req, res) => {
    const apps = await Application.find({ status: 'Pending' })
        .populate('student group timeslot');
    res.json(apps);
};

exports.reviewApplication = async (req, res) => {
    const { status } = req.body;

    if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const app = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    res.json(app);
};


// src/controllers/admin/application.js

exports.changeTimeslot = async (req, res) => {
    const { timeslot, note } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
        return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status === 'Accepted') {
        return res.status(400).json({
            message: 'Cannot change timeslot after acceptance'
        });
    }

    application.timeslot = timeslot;
    application.adminModified = true;
    application.adminNotes = note || 'Timeslot adjusted by admin';

    // Reset status if needed
    if (application.status === 'Rejected') {
        application.status = 'Pending';
    }

    await application.save();

    res.json(application);
};
