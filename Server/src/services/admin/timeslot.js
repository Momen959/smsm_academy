const Timeslot = require('../../models/Timeslot');
const Group = require('../../models/Group');
const Teacher = require('../../models/Teacher');

class TimeslotService {
    static async createTimeslot({ group, teacher, day, startTime, endTime }) {
        // Fetch group capacity
        const groupDoc = await Group.findById(group);
        if (!groupDoc) throw new Error('Group not found');

        // Helper to get next occurrence of a day
        const getNextDayDate = (dayName) => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const today = new Date();
            const targetDay = days.indexOf(dayName.toLowerCase());
            if (targetDay === -1) throw new Error('Invalid day');
            
            const currentDay = today.getDay();
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget <= 0) daysUntilTarget += 7;
            
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + daysUntilTarget);
            return nextDate;
        };

        // Parse times and create full Date objects
        const baseDate = getNextDayDate(day);
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startDateTime = new Date(baseDate);
        startDateTime.setHours(startHour, startMin, 0, 0);
        
        const endDateTime = new Date(baseDate);
        endDateTime.setHours(endHour, endMin, 0, 0);

        const timeslot = new Timeslot({
            group,
            teacher,
            startTime: startDateTime,
            endTime: endDateTime,
            maxCapacity: groupDoc.capacity,
            registeredStudents: []
        });

        return timeslot.save();
    }

    static async getAllTimeslots() {
        return Timeslot.find().populate('group teacher');
    }

    static async getTimeslotById(id) {
        return Timeslot.findById(id).populate('group teacher');
    }

    static async updateTimeslot(id, data) {
        if (data.group) {
            const groupDoc = await Group.findById(data.group);
            if (!groupDoc) throw new Error('Group not found');
            data.maxCapacity = groupDoc.capacity;
        }
        return Timeslot.findByIdAndUpdate(id, data, { new: true }).populate('group teacher');
    }

    static async deleteTimeslot(id) {
        return Timeslot.findByIdAndDelete(id);
    }
}

module.exports = TimeslotService;
