const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// GET all configs for a project
router.get('/:projectId', async (req, res) => {
    try {
        const configs = await Config.find({ projectId: req.params.projectId }).sort({ key: 1 });
        res.json(configs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE/UPDATE config (Upsert)
router.post('/', async (req, res) => {
    const { projectId, key, value, environment } = req.body;

    try {
        const config = await Config.findOneAndUpdate(
            { projectId, key, environment },
            { value, isEnabled: req.body.isEnabled !== undefined ? req.body.isEnabled : true, updatedAt: Date.now() },
            { new: true, upsert: true } // Create if not exists
        );
        res.json(config);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE config explicitly (e.g. toggle status)
router.put('/:id', async (req, res) => {
    try {
        const config = await Config.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json(config);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE config
router.delete('/:id', async (req, res) => {
    try {
        await Config.findByIdAndDelete(req.params.id);
        res.json({ message: 'Config deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
