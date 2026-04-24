const db = require('../models');

exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await db.Schedule.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.image_url = req.file.filename;
        }
        const schedule = await db.Schedule.create(data);
        res.status(201).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.image_url = req.file.filename;
        }
        await db.Schedule.update(data, { where: { id: req.params.id } });
        const updated = await db.Schedule.findByPk(req.params.id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        await db.Schedule.destroy({ where: { id: req.params.id } });
        res.json({ message: 'O\'chirildi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
