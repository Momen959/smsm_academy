const Group = require('../../models/group');
const Subject = require('../../models/Subject');

class GroupService {
    static async createGroup({ subjectId, type, capacity }) {
        const subject = await Subject.findById(subjectId);
        if (!subject) throw new Error('Subject not found');

        const group = new Group({ subject: subjectId, type, capacity });
        return group.save();
    }

    static async getAllGroups() {
        return Group.find().populate('subject', 'name');
    }

    static async getGroupById(id) {
        return Group.findById(id).populate('subject', 'name');
    }

    static async updateGroup(id, data) {
        return Group.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteGroup(id) {
        return Group.findByIdAndDelete(id);
    }
}

module.exports = GroupService;
