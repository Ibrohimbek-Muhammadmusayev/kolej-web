const db = require('./models');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        console.log("Scanning storage at:", uploadDir);
        
        if (!fs.existsSync(uploadDir)) {
            console.log("Uploads directory not found!");
            return;
        }

        const filesOnDisk = fs.readdirSync(uploadDir);
        let totalSizeOnDisk = 0;
        let totalFilesOnDisk = 0;

        console.log(`Found ${filesOnDisk.length} items in uploads folder.`);

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

        const orphanedFiles = [];
        let activeFilesCount = 0;
        let activeSize = 0;
        let orphanedSize = 0;
        
        filesOnDisk.forEach(file => {
            if (file.startsWith('.')) return; 
            
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
                console.error(e);
            }
        });

        console.log(`Scan complete: ${totalFilesOnDisk} files, ${totalSizeOnDisk} bytes. Orphaned: ${orphanedFiles.length}`);

        console.log({
            orphaned: orphanedFiles.length,
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
    } finally {
        process.exit();
    }
}
run();
