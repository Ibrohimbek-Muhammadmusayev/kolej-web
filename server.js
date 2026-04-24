require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models'); // Will be created later

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (Serve the frontend from the public directory)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve frontend for any unknown route (SPA fallback if needed, or just specific pages)
// Serve frontend pages
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Define known frontend pages
const pages = ['about.html', 'contact.html', 'news.html', 'news-details.html', 'sohalar.html', 'field-details.html'];

pages.forEach(page => {
    app.get('/' + page, (req, res) => {
        res.sendFile(path.join(__dirname, 'public/' + page));
    });
});

// Catch-all for unknown routes -> 404
app.get(/(.*)/, (req, res) => {
    // If it's an API call, return JSON 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Otherwise serve 404.html
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// Create uploads directory if not exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Start Server
// Start Server

sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
    app.listen(PORT, async () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
