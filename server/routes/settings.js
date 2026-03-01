const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Settings = require('../models/Settings');

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.body.type + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Helper to get singleton settings
async function getSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = new Settings();
        await settings.save();
    }
    return settings;
}

// GET settings
router.get('/', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH settings
router.patch('/', async (req, res) => {
    try {
        let settings = await getSettings();

        const { siteName, adminEmail, maintenanceMode, smtp, security } = req.body;

        if (siteName !== undefined) settings.siteName = siteName;
        if (adminEmail !== undefined) settings.adminEmail = adminEmail;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

        if (smtp) {
            settings.smtp = { ...settings.smtp.toObject(), ...smtp };
        }

        if (security) {
            settings.security = { ...settings.security.toObject(), ...security };
        }

        if (req.body.backups) {
            settings.backups = { ...settings.backups.toObject(), ...req.body.backups };

            // Re-schedule based on new settings
            const BackupService = require('../services/BackupService');
            if (settings.backups.enabled) {
                BackupService.schedule(settings.backups.frequency);
            } else {
                BackupService.stop();
            }
        }

        settings.updatedAt = Date.now();
        await settings.save();

        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST upload branding (logo or favicon)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const type = req.body.type; // 'logo' or 'favicon'
        if (!['logo', 'favicon'].includes(type)) {
            return res.status(400).json({ message: 'Invalid image type' });
        }

        const settings = await getSettings();
        const fileUrl = `/uploads/${req.file.filename}`;
        
        if (type === 'logo') {
            settings.logoUrl = fileUrl;
        } else {
            settings.faviconUrl = fileUrl;
        }

        await settings.save();
        res.json({ message: 'Upload successful', url: fileUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove branding
router.delete('/branding/:type', async (req, res) => {
    try {
        const type = req.params.type;
        if (!['logo', 'favicon'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type' });
        }

        const settings = await getSettings();
        if (type === 'logo') {
            settings.logoUrl = '';
        } else {
            settings.faviconUrl = '';
        }

        await settings.save();
        res.json({ message: 'Removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/settings/backups
router.get('/backups', (req, res) => {
    try {
        const BackupService = require('../services/BackupService');
        const backups = BackupService.getBackups();
        res.json(backups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/settings/backups/trigger
router.post('/backups/trigger', async (req, res) => {
    try {
        const BackupService = require('../services/BackupService');
        const result = await BackupService.performBackup();
        if (result.success) {
            res.json({ message: 'Backup created successfully', path: result.path });
        } else {
            res.status(500).json({ message: 'Backup failed', error: result.error });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/settings/backups/:name/download
router.get('/backups/:name/download', async (req, res) => {
    try {
        const BackupService = require('../services/BackupService');
        const fs = require('fs');
        const backupName = req.params.name;

        // 1. Create Zip on the fly
        const zipPath = await BackupService.createZip(backupName);

        // 2. Stream the file
        res.download(zipPath, `${backupName}.zip`, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST test-smtp
router.post('/test-smtp', async (req, res) => {
    try {
        const nodemailer = require('nodemailer');
        const { host, port, user, pass } = req.body;

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: { user, pass }
        });

        await transporter.verify();
        res.json({ message: 'SMTP Connection Successful' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
