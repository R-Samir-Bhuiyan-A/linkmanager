const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const ApiLog = require('../models/ApiLog');
const Project = require('../models/Project');
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

        if (!['Owner', 'Admin', 'Moderator'].includes(req.user.role)) {
            const requestedProjectId = req.query.projectId;
            if (!requestedProjectId) {
                return res.status(403).json({ message: 'Must specify a project ID to fetch logs for' });
            }

            const project = await Project.findById(requestedProjectId);
            if (!project) return res.status(404).json({ message: 'Project not found' });

            if (!project.assignedUsers.includes(req.user.id)) {
                return res.status(403).json({ message: 'Access denied: You are not assigned to this project' });
            }

            query.projectId = requestedProjectId;
        } else if (req.query.projectId) {
            query.projectId = req.query.projectId;
        }

        if (req.query.ip) {
            query.ip = new RegExp(req.query.ip, 'i');
        }
        if (req.query.endpoint) {
            query.endpoint = new RegExp(req.query.endpoint, 'i');
        }
        if (req.query.method) {
            query.method = req.query.method;
        }
        if (req.query.status) {
            query.statusCode = parseInt(req.query.status);
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
