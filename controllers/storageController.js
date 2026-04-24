const fs = require('fs').promises;
const path = require('path');
const db = require('../models');

// Helper function to extract just the filename from potentially varied formats
const extractFilename = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
};

const getAllReferencedFiles = async () => {
    const files = new Set();

    const [news, media, fields, team, students, slides, schedules, settings] = await Promise.all([
        db.News.findAll({ attributes: ['image_url'] }),
        db.NewsMedia.findAll({ attributes: ['src'] }),
        db.Field.findAll({ attributes: ['image_url', 'icon_url'] }),
        db.TeamMember.findAll({ attributes: ['image_url'] }),
        db.ActiveStudent.findAll({ attributes: ['image_url'] }),
        db.HeroSlide.findAll({ attributes: ['media_url'] }),
        db.Schedule.findAll({ attributes: ['image_url'] }),
        db.SiteSetting.findAll({ where: { type: 'image' } })
    ]);

    news.forEach(n => files.add(extractFilename(n.image_url)));
    media.forEach(m => files.add(extractFilename(m.src)));
    fields.forEach(f => {
        files.add(extractFilename(f.image_url));
        files.add(extractFilename(f.icon_url));
    });
    team.forEach(t => files.add(extractFilename(t.image_url)));
    students.forEach(s => files.add(extractFilename(s.image_url)));
    slides.forEach(s => files.add(extractFilename(s.media_url)));
    schedules.forEach(s => files.add(extractFilename(s.image_url)));
    settings.forEach(s => files.add(extractFilename(s.value)));

    files.delete(null);
    files.delete(undefined);
    files.delete('');
    return files;
};

exports.getStorageStats = async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, '../uploads');
        let diskFiles = [];
        try {
            diskFiles = await fs.readdir(uploadsDir);
        } catch (e) {
            // Uploads directory might not exist yet
            diskFiles = [];
        }

        const referencedFiles = await getAllReferencedFiles();
        
        let totalSize = 0;
        let orphanedSize = 0;
        let orphanedCount = 0;
        const orphanedFilesList = [];

        for (const file of diskFiles) {
            // Skip hidden files like .gitkeep
            if (file.startsWith('.')) continue;

            const filePath = path.join(uploadsDir, file);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;

            if (!referencedFiles.has(file)) {
                orphanedSize += stats.size;
                orphanedCount++;
                const ext = path.extname(file).toLowerCase();
                const type = ['.mp4', '.webm', '.ogg'].includes(ext) ? 'video' : 'image';
                orphanedFilesList.push({
                    name: file,
                    size: stats.size,
                    type,
                    createdAt: stats.mtime
                });
            }
        }

        // Sort orphaned files by date descending
        orphanedFilesList.sort((a, b) => b.createdAt - a.createdAt);

        res.json({
            totalSize,
            totalFiles: diskFiles.filter(f => !f.startsWith('.')).length,
            orphanedSize,
            orphanedCount,
            orphanedFilesList
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cleanOrphanedFiles = async (req, res) => {
    try {
        const { files } = req.body; // Array of filenames to delete
        const uploadsDir = path.join(__dirname, '../uploads');
        const diskFiles = await fs.readdir(uploadsDir);
        const referencedFiles = await getAllReferencedFiles();

        let deletedCount = 0;
        let freedSpace = 0;

        for (const file of diskFiles) {
            if (file.startsWith('.')) continue;

            // If a specific list is provided, only delete if the file is in the list
            if (files && Array.isArray(files) && !files.includes(file)) {
                continue;
            }

            if (!referencedFiles.has(file)) {
                const filePath = path.join(uploadsDir, file);
                const stats = await fs.stat(filePath);
                await fs.unlink(filePath);
                deletedCount++;
                freedSpace += stats.size;
            }
        }

        res.json({
            message: 'Tozalash muvaffaqiyatli yakunlandi',
            deletedCount,
            freedSpace
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
