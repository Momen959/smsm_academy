const Subject = require('../../models/Subject');

exports.createSubject = async (data) => {
    const existing = await Subject.findOne({ name: data.name });
    if (existing) throw new Error('Subject already exists');

    const subject = new Subject(data);
    return await subject.save();
};

exports.getSubjects = async () => {
    return await Subject.find().sort({ createdAt: -1 });
};

exports.updateSubject = async (id, data) => {
    const subject = await Subject.findById(id);
    if (!subject) throw new Error('Subject not found');

    if (data.name) subject.name = data.name;
    if (typeof data.isActive === 'boolean') subject.isActive = data.isActive;

    return await subject.save();
};

exports.deleteSubject = async (id) => {
    const Group = require('../../models/Group');
    const Timeslot = require('../../models/Timeslot');
    const Application = require('../../models/Application');
    
    const subject = await Subject.findById(id);
    if (!subject) throw new Error('Subject not found');

    // Find all groups for this subject
    const groups = await Group.find({ subject: id });
    const groupIds = groups.map(g => g._id);

    // Delete all applications that reference these groups
    if (groupIds.length > 0) {
        const deleteAppsResult = await Application.deleteMany({ group: { $in: groupIds } });
        console.log(`Deleted ${deleteAppsResult.deletedCount} applications for subject ${subject.name}`);
        
        // Delete all timeslots for these groups
        const deleteTimeslotsResult = await Timeslot.deleteMany({ group: { $in: groupIds } });
        console.log(`Deleted ${deleteTimeslotsResult.deletedCount} timeslots for subject ${subject.name}`);
        
        // Delete all groups
        const deleteGroupsResult = await Group.deleteMany({ subject: id });
        console.log(`Deleted ${deleteGroupsResult.deletedCount} groups for subject ${subject.name}`);
    }

    // Finally delete the subject
    await Subject.findByIdAndDelete(id);
    console.log(`Deleted subject: ${subject.name}`);

    return subject;
};
