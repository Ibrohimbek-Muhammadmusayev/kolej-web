const db = require('../models');

module.exports = {
    async getAllStudents(req, res) {
        try {
            const students = await db.ActiveStudent.findAll({ order: [['order', 'ASC']] });
            res.json(students);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async createStudent(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image_url = `/uploads/${req.file.filename}`;
            }
            const student = await db.ActiveStudent.create(data);
            res.status(201).json(student);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateStudent(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image_url = `/uploads/${req.file.filename}`;
            }
            await db.ActiveStudent.update(data, { where: { id: req.params.id } });
            res.json({ message: 'Updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async deleteStudent(req, res) {
        try {
            await db.ActiveStudent.destroy({ where: { id: req.params.id } });
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
