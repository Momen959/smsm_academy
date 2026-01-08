const Group = require('../../models/Group');
const Subject = require('../../models/Subject');

class GroupService {
    static async createGroup({ name, subjectId, type, capacity, level, educationType, grade }) {
    if (!subjectId) {
        throw new Error('subjectId is required');
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new Error('Subject not found');
    }

    return Group.create({
        name,
        subject: subjectId,
        type,
        capacity,
        level: level || 'beginner',
        educationType: educationType || 'national',
        grade: grade || 'G1'
    });
}


    static async getAllGroups() {
        return Group.find().populate('subject', 'name');
    }

    static async getGroupById(id) {
        return Group.findById(id).populate('subject', 'name');
    }

    static async updateGroup(id, data) {
        return Group.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    static async deleteGroup(id) {
        const Timeslot = require('../../models/Timeslot');
        const Application = require('../../models/Application');
        
        const group = await Group.findById(id);
        if (!group) throw new Error('Group not found');

        // Delete all applications that reference this group
        const deleteAppsResult = await Application.deleteMany({ group: id });
        console.log(`Deleted ${deleteAppsResult.deletedCount} applications for group ${group.name || id}`);
        
        // Delete all timeslots for this group
        const deleteTimeslotsResult = await Timeslot.deleteMany({ group: id });
        console.log(`Deleted ${deleteTimeslotsResult.deletedCount} timeslots for group ${group.name || id}`);

        // Delete the group
        await Group.findByIdAndDelete(id);
        console.log(`Deleted group: ${group.name || id}`);
        
        return group;
    }
}

module.exports = GroupService;
