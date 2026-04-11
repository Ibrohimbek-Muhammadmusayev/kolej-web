const db = require('../models');

exports.getAllFields = async (req, res) => {
    try {
        const order = req.query.random === 'true'
            ? db.sequelize.random()
            : [['order', 'ASC'], ['id', 'ASC']];
        const fields = await db.Field.findAll({
            order: order
        });
        res.json(fields);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFieldBySlug = async (req, res) => {
    try {
        const field = await db.Field.findOne({ where: { slug: req.params.slug } });
        if (!field) return res.status(404).json({ message: 'Field not found' });
        res.json(field);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createField = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.files) {
            if (req.files.image) data.image_url = `/uploads/${req.files.image[0].filename}`;
            if (req.files.icon) data.icon_url = `/uploads/${req.files.icon[0].filename}`;
        }

        const field = await db.Field.create(data);
        res.status(201).json(field);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateField = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.files) {
            if (req.files.image) data.image_url = `/uploads/${req.files.image[0].filename}`;
            if (req.files.icon) data.icon_url = `/uploads/${req.files.icon[0].filename}`;
        }

        await db.Field.update(data, { where: { id: req.params.id } });
        const field = await db.Field.findByPk(req.params.id);
        res.json(field);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteField = async (req, res) => {
    try {
        await db.Field.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
