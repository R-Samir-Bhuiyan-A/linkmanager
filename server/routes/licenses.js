const express = require('express');
const router = express.Router();
const License = require('../models/License');
const crypto = require('crypto');

// GET all licenses for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const licenses = await License.find({ project: req.params.projectId }).sort({ createdAt: -1 });
        res.json(licenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a new license
router.post('/generate', async (req, res) => {
    const { projectId, holderName, email, type, expiresAt } = req.body;

    // Generate a unique license key: PRO-XXXX-XXXX-XXXX
    const randomPart = () => crypto.randomBytes(2).toString('hex').toUpperCase();
    const key = `PRO-${randomPart()}-${randomPart()}-${randomPart()}`;

    const license = new License({
        key,
        project: projectId,
        holderName,
        email,
        type,
        expiresAt
    });

    try {
        const newLicense = await license.save();
        res.status(201).json(newLicense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// REVOKE a license
router.patch('/:id/revoke', async (req, res) => {
    try {
        const license = await License.findById(req.params.id);
        if (!license) return res.status(404).json({ message: 'License not found' });

        license.status = 'suspended';
        await license.save();
        res.json({ message: 'License revoked', license });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// RESET HWID (Unlock)
router.patch('/:id/reset-hwid', async (req, res) => {
    try {
        const license = await License.findById(req.params.id);
        if (!license) return res.status(404).json({ message: 'License not found' });

        license.hardwareId = null;
        await license.save();
        res.json({ message: 'Hardware ID reset', license });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
