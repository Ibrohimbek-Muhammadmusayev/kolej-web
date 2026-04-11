const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const newsController = require('../controllers/newsController');
const fieldController = require('../controllers/fieldController');
const applicationController = require('../controllers/applicationController');
const settingsController = require('../controllers/settingsController');
const teamController = require('../controllers/teamController');
const studentController = require('../controllers/studentController');
const statsController = require('../controllers/statsController');
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
const upload = multer({ storage: storage });

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

// --- SETTINGS ---
router.get('/settings', settingsController.getSettings);
router.put('/settings', authMiddleware, settingsController.updateSettings);

// --- TEAM ---
router.get('/team', teamController.getAllTeam);
router.post('/team', authMiddleware, upload.single('image'), teamController.createTeamMember);
router.put('/team/:id', authMiddleware, upload.single('image'), teamController.updateTeamMember);
router.delete('/team/:id', authMiddleware, teamController.deleteTeamMember);

const activeStudentController = require('../controllers/ActiveStudentController');
router.get('/active-students', activeStudentController.getAll);
router.post('/active-students', authMiddleware, upload.single('image'), activeStudentController.create);
router.delete('/active-students/:id', authMiddleware, activeStudentController.delete);

// --- STUDENTS ---
router.get('/students', studentController.getAllStudents);
router.post('/students', authMiddleware, upload.single('image'), studentController.createStudent);
router.put('/students/:id', authMiddleware, upload.single('image'), studentController.updateStudent);
router.delete('/students/:id', authMiddleware, studentController.deleteStudent);

// --- STATS ---
router.get('/stats', statsController.getAllStats);
router.put('/stats', authMiddleware, statsController.updateStats);

// --- HERO CAROUSEL ---
const heroController = require('../controllers/heroController');
router.get('/hero', heroController.getAllSlides);
router.post('/hero', authMiddleware, upload.fields([{ name: 'media', maxCount: 1 }]), heroController.createSlide);
router.put('/hero/:id', authMiddleware, upload.fields([{ name: 'media', maxCount: 1 }]), heroController.updateSlide);
router.delete('/hero/:id', authMiddleware, heroController.deleteSlide);

module.exports = router;
