const Timeslot = require('../../models/Timeslot');
const Group = require('../../models/group');
const Teacher = require('../../models/Teacher');

class TimeslotService {
    static async createTimeslot({ group, teacher, day, startTime, endTime }) {
        // Fetch group capacity
        const groupDoc = await Group.findById(group);
        if (!groupDoc) throw new Error('Group not found');

        const timeslot = new Timeslot({
            group,
            teacher,
            day,
            startTime,
            endTime,
            maxCapacity: groupDoc.capacity, // pull capacity from group
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
