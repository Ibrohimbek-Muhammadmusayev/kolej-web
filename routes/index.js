const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const newsController = require('../controllers/newsController');
const fieldController = require('../controllers/fieldController');
const applicationController = require('../controllers/applicationController');
const settingsController = require('../controllers/settingsController');
const teamController = require('../controllers/teamController');
const activeStudentController = require('../controllers/ActiveStudentController');
const statsController = require('../controllers/statsController');
const scheduleController = require('../controllers/scheduleController');
const storageController = require('../controllers/storageController');
const botController = require('../controllers/botController');
const authMiddleware = require('../middleware/auth');

// Multer config for file uploads
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, videos and documents are allowed!'));
        }
    }
});

// --- AUTH ---
router.post('/auth/login', authController.login);

// --- NEWS ---
router.get('/news', newsController.getAllNews);
router.get('/news/:id', newsController.getNewsById);
router.post('/news', authMiddleware, upload.array('files', 5), newsController.createNews);
router.put('/news/:id', authMiddleware, upload.array('files', 5), newsController.updateNews);
router.delete('/news/:id', authMiddleware, newsController.deleteNews);

// --- FIELDS ---
router.get('/fields', fieldController.getAllFields);
router.get('/fields/:slug', fieldController.getFieldBySlug);
router.post('/fields', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), fieldController.createField);
router.put('/fields/:id', authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }]), fieldController.updateField);
router.delete('/fields/:id', authMiddleware, fieldController.deleteField);

// --- APPLICATIONS ---
router.post('/applications', applicationController.createApplication);
router.get('/applications', authMiddleware, applicationController.getAllApplications);
router.put('/applications/:id/status', authMiddleware, applicationController.updateApplicationStatus);
router.delete('/applications/:id', authMiddleware, applicationController.deleteApplication);

// --- SETTINGS ---
router.get('/settings', settingsController.getSettings);
router.put('/settings', authMiddleware, settingsController.updateSettings);

// --- TEAM ---
router.get('/team', teamController.getAllTeam);
router.post('/team', authMiddleware, upload.single('image'), teamController.createTeamMember);
router.put('/team/:id', authMiddleware, upload.single('image'), teamController.updateTeamMember);
router.delete('/team/:id', authMiddleware, teamController.deleteTeamMember);

// --- ACTIVE STUDENTS ---
router.get('/active-students', activeStudentController.getAll);
router.post('/active-students', authMiddleware, upload.single('image'), activeStudentController.create);
router.put('/active-students/:id', authMiddleware, upload.single('image'), activeStudentController.update);
router.delete('/active-students/:id', authMiddleware, activeStudentController.delete);

// --- STUDENTS (Alias for compatibility) ---
router.get('/students', activeStudentController.getAll);
router.post('/students', authMiddleware, upload.single('image'), activeStudentController.create);
router.put('/students/:id', authMiddleware, upload.single('image'), activeStudentController.update);
router.delete('/students/:id', authMiddleware, activeStudentController.delete);

// --- STATS ---
router.get('/stats', statsController.getAllStats);
router.post('/stats', authMiddleware, statsController.createStat);
router.put('/stats', authMiddleware, statsController.updateStats);
router.delete('/stats/:id', authMiddleware, statsController.deleteStat);

// --- HERO CAROUSEL ---
const heroController = require('../controllers/heroController');
router.get('/hero', heroController.getAllSlides);
router.post('/hero', authMiddleware, upload.fields([{ name: 'media', maxCount: 1 }]), heroController.createSlide);
router.put('/hero/:id', authMiddleware, upload.fields([{ name: 'media', maxCount: 1 }]), heroController.updateSlide);
router.delete('/hero/:id', authMiddleware, heroController.deleteSlide);

// --- STORAGE ---
router.get('/storage/orphaned', authMiddleware, storageController.getOrphanedFiles);
router.delete('/storage/orphaned/:filename', authMiddleware, storageController.deleteOrphanedFile);
router.delete('/storage/orphaned', authMiddleware, storageController.deleteAllOrphanedFiles);

// --- SCHEDULES ---
router.get('/schedules', scheduleController.getAllSchedules);
router.post('/schedules', authMiddleware, upload.single('image'), scheduleController.createSchedule);
router.put('/schedules/:id', authMiddleware, upload.single('image'), scheduleController.updateSchedule);
router.delete('/schedules/:id', authMiddleware, scheduleController.deleteSchedule);

// --- BOT ---
router.get('/bot/status', authMiddleware, botController.getBotStatus);
router.post('/bot/token', authMiddleware, botController.updateBotToken);
router.get('/bot/registrations', authMiddleware, botController.getRegistrations);
router.delete('/bot/registrations/:id', authMiddleware, botController.deleteRegistration);
router.post('/bot/send', authMiddleware, upload.single('media'), botController.sendBroadcast);
router.post('/bot/send-single', authMiddleware, upload.single('media'), botController.sendSingleMessage);

module.exports = router;
