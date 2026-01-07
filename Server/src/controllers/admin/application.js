// src/controllers/admin/application.js
const Application = require('../../models/Application');
const Group = require('../../models/Group');
const Subject = require('../../models/Subject');
const Student = require('../../models/Student');

// Get only pending/submitted applications (for dashboard quick review)
exports.getPendingApplications = async (req, res) => {
    try {
        // Fetch only pending/submitted applications
        const apps = await Application.find({ 
            status: { $in: ['Pending', 'pending', 'Submitted', 'submitted', 'Draft', 'draft'] } 
        })
            .populate({
                path: 'student',
                select: 'firstName lastName email grade phone'
            })
            .populate({
                path: 'group',
                populate: { path: 'subject', select: 'name' }
            })
            .populate('timeslot')
            .sort({ createdAt: -1 })
            .limit(10); // Limit to recent 10

        // Transform data for admin dashboard
        const formattedApps = apps.map(app => ({
            _id: app._id,
            fullName: app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Unknown',
            email: app.student?.email || '',
            phone: app.student?.phone || '',
            grade: app.student?.grade || '',
            subject: app.group?.subject || null,
            groupType: app.group?.type || 'N/A',
            day: app.timeslot ? new Date(app.timeslot.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : '',
            time: app.timeslot ? `${new Date(app.timeslot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(app.timeslot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '',
            paymentScreenshot: app.paymentProof || '',
            status: app.status?.toLowerCase() || 'pending',
            createdAt: app.createdAt
        }));

        res.json(formattedApps);
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get ALL applications (for Applications tab - full history)
exports.getAllApplications = async (req, res) => {
    try {
        // Fetch all applications
        const apps = await Application.find({})
            .populate({
                path: 'student',
                select: 'firstName lastName email grade phone'
            })
            .populate({
                path: 'group',
                populate: { path: 'subject', select: 'name' }
            })
            .populate('timeslot')
            .sort({ createdAt: -1 });

        // Transform data for admin dashboard
        const formattedApps = apps.map(app => ({
            _id: app._id,
            fullName: app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Unknown',
            email: app.student?.email || '',
            phone: app.student?.phone || '',
            grade: app.student?.grade || '',
            subject: app.group?.subject || null,
            groupType: app.group?.type || 'N/A',
            day: app.timeslot ? new Date(app.timeslot.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : '',
            time: app.timeslot ? `${new Date(app.timeslot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${new Date(app.timeslot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '',
            paymentScreenshot: app.paymentProof || '',
            status: app.status?.toLowerCase() || 'pending',
            createdAt: app.createdAt
        }));

        res.json(formattedApps);
    } catch (error) {
        console.error('Error fetching all applications:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.reviewApplication = async (req, res) => {
    try {
        console.log('Review application request:', req.params.id, req.body);
        let { status } = req.body;

        // Normalize status to proper case
        if (status === 'approved') status = 'Accepted';
        if (status === 'rejected') status = 'Rejected';

        console.log('Normalized status:', status);

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
        }

        // Get the current application to check previous status
        const currentApp = await Application.findById(req.params.id)
            .populate('timeslot')
            .populate('student');
            
        if (!currentApp) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const previousStatus = currentApp.status;
        const Timeslot = require('../../models/Timeslot');
        const studentId = currentApp.student?._id || currentApp.student;

        // Handle capacity changes based on status transition
        if (status === 'Accepted' && previousStatus !== 'Accepted') {
            // Application is being approved - add student to registeredStudents
            if (currentApp.timeslot && studentId) {
                const timeslotId = currentApp.timeslot._id || currentApp.timeslot;
                await Timeslot.findByIdAndUpdate(timeslotId, {
                    $addToSet: { registeredStudents: studentId }
                });
                console.log('Added student to timeslot registeredStudents');
            }
        } else if (status === 'Rejected' && previousStatus === 'Accepted') {
            // Application is being rejected after being accepted - remove student
            if (currentApp.timeslot && studentId) {
                const timeslotId = currentApp.timeslot._id || currentApp.timeslot;
                await Timeslot.findByIdAndUpdate(timeslotId, {
                    $pull: { registeredStudents: studentId }
                });
                console.log('Removed student from timeslot registeredStudents');
            }
        }

        // Update application status
        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        console.log('Updated application:', app);

        res.json({ success: true, application: app });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: error.message });
    }
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
