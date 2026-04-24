const db = require('../models');
const path = require('path');
const fs = require('fs');

exports.getAllNews = async (req, res) => {
    try {
        const news = await db.News.findAll({
            include: [{ model: db.NewsMedia, as: 'media' }],
            order: [['date', 'DESC']]
        });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const news = await db.News.findByPk(req.params.id, {
            include: [{ model: db.NewsMedia, as: 'media' }]
        });
        if (!news) return res.status(404).json({ message: 'Yangilik topilmadi' });

        // Find related (simple logic: same category or random others)
        const related = await db.News.findAll({
            where: {
                id: { [db.Sequelize.Op.ne]: news.id } // exclude current
            },
            limit: 3,
            include: [{ model: db.NewsMedia, as: 'media' }]
        });

        res.json({ ...news.toJSON(), related });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createNews = async (req, res) => {
    try {
        const { title, content, date } = req.body;
        const news = await db.News.create({ title, content, date });

        if (req.files && req.files.length > 0) {
            // Update main image_url to the first file
            const mainImageUrl = req.files[0].filename;
            await news.update({ image_url: mainImageUrl });

            const mediaPromises = req.files.map(file => {
                const type = file.mimetype.startsWith('video') ? 'video' : 'image';
                const src = `/uploads/${file.filename}`;
                return db.NewsMedia.create({
                    newsId: news.id,
                    type,
                    src
                });
            });
            await Promise.all(mediaPromises);
        }

        const fullNews = await db.News.findByPk(news.id, {
            include: [{ model: db.NewsMedia, as: 'media' }]
        });

        res.status(201).json(fullNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { title, content, date } = req.body;
        await db.News.update({ title, content, date }, {
            where: { id: req.params.id }
        });

        // Handle new media upload if any (this simplistic approach just adds, usually you'd want to manage deletions too)
        if (req.files && req.files.length > 0) {
            // Update main image_url to the first file
            const mainImageUrl = req.files[0].filename;
            await db.News.update({ image_url: mainImageUrl }, { where: { id: req.params.id } });

            const mediaPromises = req.files.map(file => {
                const type = file.mimetype.startsWith('video') ? 'video' : 'image';
                const src = `/uploads/${file.filename}`;
                return db.NewsMedia.create({
                    newsId: req.params.id,
                    type,
                    src
                });
            });
            await Promise.all(mediaPromises);
        }

        const news = await db.News.findByPk(req.params.id, {
            include: [{ model: db.NewsMedia, as: 'media' }]
        });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const news = await db.News.findByPk(req.params.id, {
            include: [{ model: db.NewsMedia, as: 'media' }]
        });
        if (!news) return res.status(404).json({ message: 'Not found' });

        // Delete physical files
        if (news.media) {
            news.media.forEach(m => {
                const filePath = path.join(__dirname, '..', m.src);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        await news.destroy();
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
