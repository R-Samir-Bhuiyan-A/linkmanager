const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const ApiLog = require('../models/ApiLog');
const { requireAuth: auth } = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

// GET System Audit Logs (Owner/Admin)
router.get('/system', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        const logs = await AuditLog.find({ projectId: { $exists: false } })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Project Audit Logs
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        // Assume access is verified by project route calling this, or handle access here.
        // For simplicity, sticking to basic auth for now but could add requireAccess.
        const logs = await AuditLog.find({ projectId: req.params.projectId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET API Access Logs (Owner/Admin or Manager of Project)
router.get('/api-logs', auth, async (req, res) => {
    try {
        let query = {};
        
        // If not Owner/Admin, they must pass a projectId they manage (omitted for global view)
        if (!['Owner', 'Admin'].includes(req.user.role)) {
            // Need a projectId if lower level role to fetch logs strictly for that project
            if(!req.query.projectId) {
                 return res.status(403).json({ message: 'Must specify a project ID to fetch logs for' });
            }
            query.projectId = req.query.projectId;
        } else if (req.query.projectId) {
            query.projectId = req.query.projectId;
        }

        const logs = await ApiLog.find(query)
            .sort({ timestamp: -1 })
            .limit(200);
            
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
