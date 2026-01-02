const GroupService = require('../../services/admin/group');

exports.createGroup = async (req, res) => {
    try {
        const { subjectId, type, capacity } = req.body;
        const group = await GroupService.createGroup({ subjectId, type, capacity });
        res.status(201).json({ success: true, group });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await GroupService.getAllGroups();
        res.json({ success: true, groups });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getGroup = async (req, res) => {
    try {
        const group = await GroupService.getGroupById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        res.json({ success: true, group });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const group = await GroupService.updateGroup(req.params.id, req.body);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        res.json({ success: true, group });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await GroupService.deleteGroup(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        res.json({ success: true, message: 'Group deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
