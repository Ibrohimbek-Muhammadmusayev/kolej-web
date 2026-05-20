const db = require('../models');
const { deleteFile } = require('../utils/fileHelper');
const path = require('path');

module.exports = {
    // Get all
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

    // Create
    async create(req, res) {
        try {
            const data = { ...req.body };

            if (req.file) {
                data.image_url = '/uploads/' + req.file.filename;
            }

            const student = await db.ActiveStudent.create(data);
            res.status(201).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update
    async update(req, res) {
        try {
            const data = { ...req.body };
            const student = await db.ActiveStudent.findByPk(req.params.id);

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            if (req.file) {
                if (student.image_url) {
                    deleteFile(student.image_url);
                }
                data.image_url = '/uploads/' + req.file.filename;
            }

            await db.ActiveStudent.update(data, { where: { id: req.params.id } });
            const updated = await db.ActiveStudent.findByPk(req.params.id);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete
    async delete(req, res) {
        try {
            const { id } = req.params;
            const student = await db.ActiveStudent.findByPk(id);

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            if (student.image_url) {
                deleteFile(student.image_url);
            }

            await student.destroy();
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
