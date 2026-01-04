// src/controllers/user/timeslot.js
const Timeslot = require('../../models/Timeslot');
const Group = require('../../models/group');

/**
 * Get available timeslots for a subject
 * Optionally filter by group type, level, education type
 */
exports.getTimeslots = async (req, res) => {
    try {
        const { subjectId, groupType, educationType } = req.query;

        // Build query for groups
        let groupQuery = {};
        if (subjectId) {
            groupQuery.subject = subjectId;
        }
        if (groupType) {
            groupQuery.type = groupType;
        }

        // Find matching groups
        const groups = await Group.find(groupQuery).populate('subject');
        const groupIds = groups.map(g => g._id);

        // Find timeslots for these groups
        const timeslots = await Timeslot.find({ group: { $in: groupIds } })
            .populate({
                path: 'group',
                populate: { path: 'subject' }
            })
            .populate('teacher');

        // Format response for frontend
        const formattedSlots = timeslots.map(slot => ({
            _id: slot._id,
            day: getDayFromDate(slot.startTime),
            startTime: formatTime(slot.startTime),
            endTime: formatTime(slot.endTime),
            teacher: slot.teacher?.name || 'TBA',
            capacity: slot.maxCapacity || 20,
            enrolled: slot.registeredStudents?.length || 0,
            available: (slot.registeredStudents?.length || 0) < (slot.maxCapacity || 20),
            group: {
                _id: slot.group?._id,
                type: slot.group?.type,
                subject: slot.group?.subject?.name
            }
        }));

        res.status(200).json(formattedSlots);
    } catch (error) {
        console.error('Error fetching timeslots:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get timeslots grouped by time for timetable display
 */
exports.getTimeslotGrid = async (req, res) => {
    try {
        const { subjectId, groupType } = req.query;

        // Build query
        let groupQuery = {};
        if (subjectId) {
            groupQuery.subject = subjectId;
        }
        if (groupType) {
            groupQuery.type = groupType;
        }

        // Find matching groups
        const groups = await Group.find(groupQuery);
        const groupIds = groups.map(g => g._id);

        // Find timeslots
        const timeslots = await Timeslot.find({ group: { $in: groupIds } })
            .populate({
                path: 'group',
                populate: { path: 'subject' }
            })
            .populate('teacher');

        // Group by time
        const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
        const timeLabels = [
            { start: '08:00', end: '10:00', label: '8-10 AM' },
            { start: '10:00', end: '12:00', label: '10-12 PM' },
            { start: '12:00', end: '14:00', label: '12-2 PM' },
            { start: '14:00', end: '16:00', label: '2-4 PM' },
            { start: '16:00', end: '18:00', label: '4-6 PM' },
            { start: '18:00', end: '20:00', label: '6-8 PM' }
        ];

        // Create grid structure
        const grid = timeLabels.map(time => ({
            ...time,
            slots: days.map(day => {
                // Find timeslot for this day/time
                const slot = timeslots.find(ts => {
                    const slotDay = getDayFromDate(ts.startTime);
                    const slotTime = formatTime(ts.startTime);
                    return slotDay === day && slotTime.startsWith(time.start.split(':')[0]);
                });

                if (slot) {
                    return {
                        _id: slot._id,
                        day,
                        time: time.label,
                        startTime: time.start,
                        endTime: time.end,
                        teacher: slot.teacher?.name || 'TBA',
                        capacity: slot.maxCapacity || 20,
                        enrolled: slot.registeredStudents?.length || 0,
                        available: (slot.registeredStudents?.length || 0) < (slot.maxCapacity || 20)
                    };
                }

                // Return empty slot
                return {
                    day,
                    time: time.label,
                    startTime: time.start,
                    endTime: time.end,
                    teacher: null,
                    capacity: 0,
                    enrolled: 0,
                    available: false
                };
            })
        }));

        res.status(200).json({
            days,
            timeSlots: grid
        });
    } catch (error) {
        console.error('Error fetching timeslot grid:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper functions
function getDayFromDate(date) {
    if (!date) return 'Sat';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(date).getDay()];
}

function formatTime(date) {
    if (!date) return '00:00';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
