// src/controllers/user/timeslot.js
const Timeslot = require('../../models/Timeslot');
const Group = require('../../models/Group');
const { DayConfig, TimePeriodConfig } = require('../../config/TimeSlotConfig');

// Default configurations (fallback if database is empty)
const DEFAULT_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DEFAULT_TIME_LABELS = [
    { start: '08:00', end: '10:00', label: '8-10 AM' },
    { start: '10:00', end: '12:00', label: '10-12 PM' },
    { start: '12:00', end: '14:00', label: '12-2 PM' },
    { start: '14:00', end: '16:00', label: '2-4 PM' },
    { start: '16:00', end: '18:00', label: '4-6 PM' },
    { start: '18:00', end: '20:00', label: '6-8 PM' }
];

/**
 * Get days configuration from database (with fallback)
 */
async function getDaysConfig() {
    try {
        const daysFromDb = await DayConfig.getActiveDays();
        if (daysFromDb && daysFromDb.length > 0) {
            return daysFromDb.map(d => d.code);
        }
    } catch (error) {
        console.warn('Could not load days from database:', error.message);
    }
    return DEFAULT_DAYS;
}

/**
 * Get time periods configuration from database (with fallback)
 */
async function getTimePeriodsConfig() {
    try {
        const timesFromDb = await TimePeriodConfig.getActiveTimePeriods();
        if (timesFromDb && timesFromDb.length > 0) {
            return timesFromDb.map(t => ({
                start: t.startTime,
                end: t.endTime,
                label: t.label
            }));
        }
    } catch (error) {
        console.warn('Could not load time periods from database:', error.message);
    }
    return DEFAULT_TIME_LABELS;
}

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
                name: slot.group?.name,
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

        // Get days and time periods from database
        const days = await getDaysConfig();
        const timeLabels = await getTimePeriodsConfig();

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
                        groupName: slot.group?.name || '',
                        capacity: slot.maxCapacity || 20,
                        enrolled: slot.registeredStudents?.length || 0,
                        available: (slot.registeredStudents?.length || 0) < (slot.maxCapacity || 20),
                        hasSlot: true
                    };
                }

                // Return empty slot (no timeslot scheduled for this day/time)
                return {
                    day,
                    time: time.label,
                    startTime: time.start,
                    endTime: time.end,
                    teacher: null,
                    capacity: 0,
                    enrolled: 0,
                    available: false,
                    hasSlot: false,
                    isEmpty: true
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

/**
 * Get time configuration (available days and time periods)
 */
exports.getTimeConfig = async (req, res) => {
    try {
        const days = await getDaysConfig();
        const timePeriods = await getTimePeriodsConfig();
        
        res.status(200).json({
            days,
            timePeriods
        });
    } catch (error) {
        console.error('Error fetching time config:', error);
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
