const db = require('../models');
const path = require('path');
const fs = require('fs');

module.exports = {
    // Get all (public)
    async getAll(req, res) {
        try {
            const students = await db.ActiveStudent.findAll({
                order: [['order', 'ASC'], ['createdAt', 'DESC']]
            });
            res.json(students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create (admin)
    async create(req, res) {
        try {
            const { full_name_uz, field_uz, achievement_uz, order } = req.body;
            let image_url = null;

            if (req.file) {
                image_url = '/uploads/' + req.file.filename;
            }

            const student = await db.ActiveStudent.create({
                full_name_uz,
                field_uz,
                achievement_uz,
                image_url,
                order: order || 0
            });

            res.status(201).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete (admin)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const student = await db.ActiveStudent.findByPk(id);

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            // Delete image if exists
            if (student.image_url) {
                const imagePath = path.join(__dirname, '../..', student.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await student.destroy();
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
