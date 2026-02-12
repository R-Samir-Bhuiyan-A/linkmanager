const express = require('express');
const router = express.Router();
const Instance = require('../models/Instance');

// GET instances for a project
router.get('/:projectId', async (req, res) => {
    try {
        // Return last 100 active instances sorted by heartbeat
        const instances = await Instance.find({ projectId: req.params.projectId })
            .sort({ lastHeartbeat: -1 })
            .limit(100);
        res.json(instances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
