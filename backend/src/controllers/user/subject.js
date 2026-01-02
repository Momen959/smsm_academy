const Subject = require('../../models/Subject');

exports.getActiveSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({isActive:true}, {name:1});
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};