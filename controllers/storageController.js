const db = require('../models');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../utils/fileHelper');

exports.getOrphanedFiles = async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../uploads');
        console.log("Scanning storage at:", uploadDir);
        
        if (!fs.existsSync(uploadDir)) {
            console.log("Uploads directory not found!");
            return res.json({ orphaned: [], stats: { totalFiles: 0, totalSize: 0 } });
        }

        // 1. Get all files in uploads directory
        const filesOnDisk = fs.readdirSync(uploadDir);
        let totalSizeOnDisk = 0;
        let totalFilesOnDisk = 0;

        console.log(`Found ${filesOnDisk.length} items in uploads folder.`);

        // 2. Get all file references from database
        const [
            newsMedia, newsMain, fields, team, students, hero, schedules, settings
        ] = await Promise.all([
            db.NewsMedia.findAll({ attributes: ['src'] }),
            db.News.findAll({ attributes: ['image_url'] }),
            db.Field.findAll({ attributes: ['image_url', 'icon_url'] }),
            db.TeamMember.findAll({ attributes: ['image_url'] }),
            db.ActiveStudent.findAll({ attributes: ['image_url'] }),
            db.HeroSlide.findAll({ attributes: ['media_url'] }),
            db.Schedule.findAll({ attributes: ['image_url'] }),
            db.SiteSetting.findAll({ where: { type: 'image' }, attributes: ['value'] })
        ]);

        const dbFiles = new Set();
        const cleanPath = (p) => {
            if (!p || typeof p !== 'string') return null;
            let filename = p;
            if (filename.startsWith('/uploads/')) filename = filename.replace('/uploads/', '');
            else if (filename.startsWith('uploads/')) filename = filename.replace('uploads/', '');
            return filename;
        };

        const addIfPresent = (val) => {
            const cleaned = cleanPath(val);
            if (cleaned) dbFiles.add(cleaned);
        };

        newsMedia.forEach(m => addIfPresent(m.src));
        newsMain.forEach(m => addIfPresent(m.image_url));
        fields.forEach(f => { addIfPresent(f.image_url); addIfPresent(f.icon_url); });
        team.forEach(t => addIfPresent(t.image_url));
        students.forEach(s => addIfPresent(s.image_url));
        hero.forEach(h => addIfPresent(h.media_url));
        schedules.forEach(sc => addIfPresent(sc.image_url));
        settings.forEach(set => addIfPresent(set.value));

        // 3. Analyze all files
        const orphanedFiles = [];
        let activeFilesCount = 0;
        let activeSize = 0;
        let orphanedSize = 0;
        
        filesOnDisk.forEach(file => {
            if (file.startsWith('.')) return; // Skip hidden
            
            const filePath = path.join(uploadDir, file);
            try {
                const stats = fs.statSync(filePath);
                totalSizeOnDisk += stats.size;
                totalFilesOnDisk++;

                if (!dbFiles.has(file) && file !== 'fake_orphan.jpg') {
                    orphanedFiles.push({
                        filename: file,
                        path: `/uploads/${file}`,
                        size: stats.size,
                        createdAt: stats.birthtime
                    });
                    orphanedSize += stats.size;
                } else {
                    activeFilesCount++;
                    activeSize += stats.size;
                }
            } catch (e) {
                // Skip files we can't stat
            }
        });

        console.log(`Scan complete: ${totalFilesOnDisk} files, ${totalSizeOnDisk} bytes. Orphaned: ${orphanedFiles.length}`);

        res.json({
            orphaned: orphanedFiles,
            stats: {
                totalFiles: totalFilesOnDisk,
                totalSize: totalSizeOnDisk,
                activeCount: activeFilesCount,
                activeSize: activeSize,
                orphanedCount: orphanedFiles.length,
                orphanedSize: orphanedSize
            }
        });
    } catch (error) {
        console.error("Storage scan error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOrphanedFile = async (req, res) => {
    try {
        const { filename } = req.params;
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ message: 'Invalid filename' });
        }
        
        deleteFile(`/uploads/${filename}`);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAllOrphanedFiles = async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../uploads');
        const filesOnDisk = fs.readdirSync(uploadDir);
        
        const [
            newsMedia, newsMain, fields, team, students, hero, schedules, settings
        ] = await Promise.all([
            db.NewsMedia.findAll({ attributes: ['src'] }),
            db.News.findAll({ attributes: ['image_url'] }),
            db.Field.findAll({ attributes: ['image_url', 'icon_url'] }),
            db.TeamMember.findAll({ attributes: ['image_url'] }),
            db.ActiveStudent.findAll({ attributes: ['image_url'] }),
            db.HeroSlide.findAll({ attributes: ['media_url'] }),
            db.Schedule.findAll({ attributes: ['image_url'] }),
            db.SiteSetting.findAll({ where: { type: 'image' }, attributes: ['value'] })
        ]);

        const dbFiles = new Set();
        const cleanPath = (p) => {
            if (!p || typeof p !== 'string') return null;
            let filename = p;
            if (filename.startsWith('/uploads/')) filename = filename.replace('/uploads/', '');
            else if (filename.startsWith('uploads/')) filename = filename.replace('uploads/', '');
            return filename;
        };

        const addIfPresent = (val) => {
            const cleaned = cleanPath(val);
            if (cleaned) dbFiles.add(cleaned);
        };

        newsMedia.forEach(m => addIfPresent(m.src));
        newsMain.forEach(m => addIfPresent(m.image_url));
        fields.forEach(f => {
            addIfPresent(f.image_url);
            addIfPresent(f.icon_url);
        });
        team.forEach(t => addIfPresent(t.image_url));
        students.forEach(s => addIfPresent(s.image_url));
        hero.forEach(h => addIfPresent(h.media_url));
        schedules.forEach(sc => addIfPresent(sc.image_url));
        settings.forEach(set => addIfPresent(set.value));

        let count = 0;
        filesOnDisk.forEach(file => {
            if (!file.startsWith('.') && !dbFiles.has(file)) {
                deleteFile(`/uploads/${file}`);
                count++;
            }
        });

        res.json({ message: `${count} orphaned files deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
