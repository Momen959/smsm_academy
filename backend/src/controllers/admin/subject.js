const subjectService = require('../../services/admin/subject');

exports.createSubject = async (req, res) => {
    try {
        const subject = await subjectService.createSubject(req.body);
        res.status(201).json(subject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.getSubjects();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const subject = await subjectService.updateSubject(req.params.id, req.body);
        res.json(subject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await subjectService.deleteSubject(req.params.id);
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
