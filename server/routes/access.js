const express = require('express');
const router = express.Router();
const AccessRule = require('../models/AccessRule');

// GET all rules for a project
router.get('/:projectId', async (req, res) => {
    try {
        const rules = await AccessRule.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
        res.json(rules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE rule
router.post('/', async (req, res) => {
    const rule = new AccessRule({
        projectId: req.body.projectId,
        type: req.body.type,
        value: req.body.value,
        condition: req.body.condition,
        action: req.body.action,
        reason: req.body.reason,
        message: req.body.message,
        expiresAt: req.body.expiresAt
    });

    try {
        const newRule = await rule.save();
        res.status(201).json(newRule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE rule
router.delete('/:id', async (req, res) => {
    try {
        await AccessRule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rule deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
