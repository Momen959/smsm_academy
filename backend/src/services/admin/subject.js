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
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) throw new Error('Subject not found');

    return subject;
};
