const db = require('../models');
const fs = require('fs');
const path = require('path');

exports.getAllSlides = async (req, res) => {
    try {
        const slides = await db.HeroSlide.findAll({
            order: [['order', 'ASC'], ['id', 'ASC']]
        });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSlide = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.files && req.files.media) {
            const file = req.files.media[0];
            data.media_url = `/uploads/${file.filename}`;

            // Auto-detect type if not provided
            if (!data.media_type) {
                const ext = path.extname(file.filename).toLowerCase();
                if (['.mp4', '.webm', '.ogg'].includes(ext)) {
                    data.media_type = 'video';
                } else {
                    data.media_type = 'image';
                }
            }
        } else if (!data.media_url) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const slide = await db.HeroSlide.create(data);
        res.status(201).json(slide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSlide = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.files && req.files.media) {
            const file = req.files.media[0];
            data.media_url = `/uploads/${file.filename}`;

            // Auto-detect type
            const ext = path.extname(file.filename).toLowerCase();
            if (['.mp4', '.webm', '.ogg'].includes(ext)) {
                data.media_type = 'video';
            } else {
                data.media_type = 'image';
            }
        }

        await db.HeroSlide.update(data, { where: { id: req.params.id } });
        const slide = await db.HeroSlide.findByPk(req.params.id);
        res.json(slide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSlide = async (req, res) => {
    try {
        const slide = await db.HeroSlide.findByPk(req.params.id);
        if (slide) {
            // Optional: Delete file from uploads if needed
            // const filePath = path.join(__dirname, '../../', slide.media_url);
            // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            await slide.destroy();
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
