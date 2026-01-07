// src/controllers/user/application.js
const Application = require('../../models/Application');
const Student = require('../../models/Student');
const Group = require('../../models/Group');
const Subject = require('../../models/Subject');
const ConfigOption = require('../../config/ConfigOption');

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
 * Validate grade value against database
 */
async function validateGrade(grade) {
    // Check if the grade exists in the database
    const gradeOption = await ConfigOption.findOne({ 
        category: 'grade', 
        value: grade,
        isActive: true 
    });
    
    if (gradeOption) {
        return grade;
    }
    
    // If not found, try to find a matching grade (case-insensitive)
    const allGrades = await ConfigOption.find({ category: 'grade', isActive: true });
    const matchingGrade = allGrades.find(g => 
        g.value.toLowerCase() === grade.toLowerCase() ||
        g.labelEn.toLowerCase().replace(/\s+/g, '').includes(grade.toLowerCase().replace(/\s+/g, ''))
    );
    
    if (matchingGrade) {
        return matchingGrade.value;
    }
    
    // Return default grade if no match found
    console.warn(`Grade "${grade}" not found in database, using default "G1"`);
    return 'G1';
}

/**
 * Validate education type value against database
 */
async function validateEducationType(educationType) {
    // Check if the education type exists in the database
    const eduOption = await ConfigOption.findOne({ 
        category: 'educationType', 
        value: educationType?.toLowerCase(),
        isActive: true 
    });
    
    if (eduOption) {
        return educationType.toLowerCase();
    }
    
    // If not found, try to find a matching type
    const allTypes = await ConfigOption.find({ category: 'educationType', isActive: true });
    const matchingType = allTypes.find(t => 
        t.value.toLowerCase() === educationType?.toLowerCase() ||
        t.labelEn.toLowerCase() === educationType?.toLowerCase()
    );
    
    if (matchingType) {
        return matchingType.value;
    }
    
    // Return default education type if no match found
    console.warn(`Education type "${educationType}" not found in database, using default "national"`);
    return 'national';
}

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
            scheduleTime,
            timeslotId  // Added timeslot ID
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

        // Validate grade against database
        const validatedGrade = await validateGrade(grade);
        
        // Validate education type against database
        const validatedEducationType = await validateEducationType(educationType);

        // Find or create student
        let student = await Student.findOne({ email });
        if (!student) {
            student = await Student.create({
                firstName,
                lastName,
                email,
                grade: validatedGrade,
                educationType: validatedEducationType
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

        // Create application with timeslot
        const applicationData = {
            student: student._id,
            group: group ? group._id : null,
            timeslot: timeslotId || null,  // Include the timeslot ID!
            status: 'Pending'
        };

        // Add payment proof if file was uploaded
        if (req.file) {
            applicationData.paymentProof = req.file.path;
        }

        const application = await Application.create(applicationData);

        // Add student to timeslot's registeredStudents array
        if (timeslotId) {
            const Timeslot = require('../../models/Timeslot');
            await Timeslot.findByIdAndUpdate(timeslotId, {
                $addToSet: { registeredStudents: student._id }
            });
        }

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

/**
 * Get applications by student email (for status syncing)
 */
exports.getApplicationsByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find student by email
        const student = await Student.findOne({ email: email.toLowerCase() });
        
        if (!student) {
            return res.json({ applications: [] });
        }

        // Get all applications for this student
        const applications = await Application.find({ student: student._id })
            .populate({
                path: 'group',
                populate: { path: 'subject', select: 'name' }
            })
            .populate('timeslot')
            .sort({ createdAt: -1 });

        // Format response
        const formattedApps = applications.map(app => ({
            _id: app._id,
            status: app.status?.toLowerCase() || 'pending',
            subject: app.group?.subject || null,
            groupType: app.group?.type || 'N/A',
            schedule: {
                day: app.timeslot ? new Date(app.timeslot.startTime).toLocaleDateString('en-US', { weekday: 'short' }) : '',
                time: app.timeslot ? `${new Date(app.timeslot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : ''
            },
            createdAt: app.createdAt
        }));

        res.json({ applications: formattedApps });
    } catch (error) {
        console.error('Error getting applications by email:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get single application status by ID
 */
exports.getApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const app = await Application.findById(id);
        
        if (!app) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        res.json({ 
            _id: app._id,
            status: app.status?.toLowerCase() || 'pending'
        });
    } catch (error) {
        console.error('Error getting application status:', error);
        res.status(500).json({ message: error.message });
    }
};
