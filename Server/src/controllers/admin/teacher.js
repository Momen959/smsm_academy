const TeacherService = require('../../services/admin/teacher');

exports.createTeacher = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const teacher = await TeacherService.createTeacher({ name, email, phone });
        res.status(201).json({ success: true, teacher });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await TeacherService.getAllTeachers();
        res.json({ success: true, teachers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTeacher = async (req, res) => {
    try {
        const teacher = await TeacherService.getTeacherById(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
        res.json({ success: true, teacher });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await TeacherService.updateTeacher(req.params.id, req.body);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
        res.json({ success: true, teacher });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await TeacherService.deleteTeacher(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
        res.json({ success: true, message: 'Teacher deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
