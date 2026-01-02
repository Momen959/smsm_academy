const TimeslotService = require('../../services/admin/timeslot');

exports.createTimeslot = async (req, res) => {
    try {
        const timeslot = await TimeslotService.createTimeslot(req.body);
        res.status(201).json({ success: true, timeslot });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getTimeslots = async (req, res) => {
    try {
        const timeslots = await TimeslotService.getAllTimeslots();
        res.json({ success: true, timeslots });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTimeslot = async (req, res) => {
    try {
        const timeslot = await TimeslotService.getTimeslotById(req.params.id);
        if (!timeslot) return res.status(404).json({ success: false, message: 'Timeslot not found' });
        res.json({ success: true, timeslot });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTimeslot = async (req, res) => {
    try {
        const timeslot = await TimeslotService.updateTimeslot(req.params.id, req.body);
        if (!timeslot) return res.status(404).json({ success: false, message: 'Timeslot not found' });
        res.json({ success: true, timeslot });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteTimeslot = async (req, res) => {
    try {
        const timeslot = await TimeslotService.deleteTimeslot(req.params.id);
        if (!timeslot) return res.status(404).json({ success: false, message: 'Timeslot not found' });
        res.json({ success: true, message: 'Timeslot deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
