// src/controllers/user/application.js
const Application = require('../../models/Application');
const Student = require('../../models/Student');
const Group = require('../../models/group');
const Subject = require('../../models/Subject');

exports.createDraft = async (req, res) => {
    try {
        const { student, group } = req.body;

        const app = await Application.create({
            student,
            group
        });

        res.status(201).json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.selectTimeslot = async (req, res) => {
    try {
        const { timeslot } = req.body;

        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { timeslot, status: 'ScheduleSelected' },
            { new: true }
        );

        res.json(app);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitApplication = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Combined endpoint: Create student, find group, and submit application in one request
 * This is used by the frontend form submission
 */
exports.createAndSubmit = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            grade,
            subjectId,
            groupType,
            groupLevel,
            educationType,
            scheduleDay,
            scheduleTime
        } = req.body;

        // Validate required fields
        if (!fullName || !email || !grade) {
            return res.status(400).json({ 
                message: 'Full name, email, and grade are required' 
            });
        }

        // Parse full name into first and last name
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];

        // Map frontend grade to backend enum
        const gradeMap = {
            'grade7': 'G7',
            'grade8': 'G8',
            'grade9': 'G9',
            'grade10': 'G10',
            'grade11': 'G11',
            'grade12': 'G12'
        };
        const mappedGrade = gradeMap[grade] || 'G10';

        // Map education type
        const eduTypeMap = {
            'national': 'national',
            'international': 'international',
            'igcse': 'international',
            'american': 'international'
        };
        const mappedEducationType = eduTypeMap[educationType] || 'national';

        // Find or create student
        let student = await Student.findOne({ email });
        if (!student) {
            student = await Student.create({
                firstName,
                lastName,
                email,
                grade: mappedGrade,
                educationType: mappedEducationType
            });
        }

        // Find suitable group (or use first available group for the subject)
        let group = null;
        if (subjectId) {
            // Try to find a group with matching criteria
            group = await Group.findOne({
                subject: subjectId,
                type: groupType || undefined,
                level: groupLevel || undefined
            }).populate('subject');

            // If no exact match, find any group for this subject
            if (!group) {
                group = await Group.findOne({ subject: subjectId });
            }
        }

        // If no group found, find any active group
        if (!group) {
            group = await Group.findOne({});
        }

        // Create application
        const applicationData = {
            student: student._id,
            group: group ? group._id : null,
            status: 'Pending'
        };

        // Add payment proof if file was uploaded
        if (req.file) {
            applicationData.paymentProof = req.file.path;
        }

        const application = await Application.create(applicationData);

        // Populate and return
        const populatedApp = await Application.findById(application._id)
            .populate('student')
            .populate({
                path: 'group',
                populate: { path: 'subject' }
            });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: populatedApp
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};
