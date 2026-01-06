const Group = require('../../models/Group');
const Subject = require('../../models/Subject');

class GroupService {
    static async createGroup({ subjectId, type, capacity, level, educationType, grade }) {
    if (!subjectId) {
        throw new Error('subjectId is required');
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
        throw new Error('Subject not found');
    }

    return Group.create({
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
        return Group.findByIdAndDelete(id);
    }
}

module.exports = GroupService;
