const db = require('../models');
const { deleteFile } = require('../utils/fileHelper');

module.exports = {
    // Get all
    async getAllSchedules(req, res) {
        try {
            const schedules = await db.Schedule.findAll({
                order: [['order', 'ASC'], ['createdAt', 'DESC']]
            });
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create
    async createSchedule(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image_url = req.file.filename;
            }
            const schedule = await db.Schedule.create(data);
            res.status(201).json(schedule);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update
    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const schedule = await db.Schedule.findByPk(id);

            if (!schedule) {
                return res.status(404).json({ message: 'Schedule not found' });
            }

            if (req.file) {
                if (schedule.image_url) {
                    deleteFile('/uploads/' + schedule.image_url);
                }
                data.image_url = req.file.filename;
            }

            await db.Schedule.update(data, { where: { id } });
            const updated = await db.Schedule.findByPk(id);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete
    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;
            const schedule = await db.Schedule.findByPk(id);

            if (!schedule) {
                return res.status(404).json({ message: 'Schedule not found' });
            }

            if (schedule.image_url) {
                deleteFile('/uploads/' + schedule.image_url);
            }

            await schedule.destroy();
            res.json({ message: 'Schedule deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
