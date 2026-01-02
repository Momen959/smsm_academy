const Teacher = require('../../models/Teacher');

class TeacherService {
    static async createTeacher({ firstName, lastName, email, specialization }) {
        const teacher = new Teacher({ firstName, lastName, email, specialization });
        return teacher.save();
    }

    static async getAllTeachers() {
        return Teacher.find();
    }

    static async getTeacherById(id) {
        return Teacher.findById(id);
    }

    static async updateTeacher(id, data) {
        return Teacher.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteTeacher(id) {
        return Teacher.findByIdAndDelete(id);
    }
}

module.exports = TeacherService;