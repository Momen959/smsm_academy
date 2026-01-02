const Application = require('../../models/Application');
const Timeslot = require('../../models/Timeslot');

class ApplicationService {
    // Create a new application
    static async createApplication({ student, group, timeslot }) {
        // Validate timeslot exists
        const timeslotDoc = await Timeslot.findById(timeslot);
        if (!timeslotDoc) throw new Error('Timeslot not found');

        // Check if timeslot is full
        if (timeslotDoc.registeredStudents.length >= timeslotDoc.maxCapacity) {
            throw new Error('Timeslot is full');
        }

        const application = new Application({
            student,
            group,
            timeslot,
            status: 'Draft'
        });

        // Save application
        const savedApp = await application.save();

        // Optionally register student in timeslot
        timeslotDoc.registeredStudents.push(student);
        await timeslotDoc.save();

        return savedApp;
    }

    static async getAllApplications() {
        return Application.find()
            .populate('student group timeslot');
    }

    static async getApplicationById(id) {
        return Application.findById(id)
            .populate('student group timeslot');
    }

    static async updateApplication(id, data) {
        // If changing timeslot, handle registration updates
        if (data.timeslot) {
            const newTimeslot = await Timeslot.findById(data.timeslot);
            if (!newTimeslot) throw new Error('Timeslot not found');

            if (newTimeslot.registeredStudents.length >= newTimeslot.maxCapacity) {
                throw new Error('Timeslot is full');
            }

            const app = await Application.findById(id);
            if (!app) throw new Error('Application not found');

            // Remove student from old timeslot if exists
            if (app.timeslot) {
                const oldTimeslot = await Timeslot.findById(app.timeslot);
                oldTimeslot.registeredStudents = oldTimeslot.registeredStudents.filter(
                    s => s.toString() !== app.student.toString()
                );
                await oldTimeslot.save();
            }

            // Register in new timeslot
            newTimeslot.registeredStudents.push(app.student);
            await newTimeslot.save();
        }

        return Application.findByIdAndUpdate(id, data, { new: true })
            .populate('student group timeslot');
    }

    static async deleteApplication(id) {
        const app = await Application.findById(id);
        if (!app) throw new Error('Application not found');

        // Remove student from timeslot
        if (app.timeslot) {
            const timeslotDoc = await Timeslot.findById(app.timeslot);
            timeslotDoc.registeredStudents = timeslotDoc.registeredStudents.filter(
                s => s.toString() !== app.student.toString()
            );
            await timeslotDoc.save();
        }

        return Application.findByIdAndDelete(id);
    }
}

module.exports = ApplicationService;
