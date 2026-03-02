const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const crypto = require('crypto');
const { requireAuth: auth } = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET all projects (Filtered by Role)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};

        // Manage-only and View-only can only see assigned projects
        if (['Manage-only', 'View-only'].includes(req.user.role)) {
            query.assignedUsers = req.user.id;
        }

        const projects = await Project.find(query).select('+secretKey').sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check assigned access
        if (['Manage-only', 'View-only'].includes(req.user.role)) {
            if (!project.assignedUsers.includes(req.user.id)) {
                return res.status(403).json({ message: 'Access denied: You are not assigned to this project' });
            }
        }

        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE project (Admin/Owner only)
router.post('/', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    const { name, slug, category, description, links, assignedUsers } = req.body;

    // Generate keys
    const publicId = 'pub_' + crypto.randomBytes(8).toString('hex');
    const secretKey = 'sec_' + crypto.randomBytes(16).toString('hex');

    const project = new Project({
        name,
        slug,
        category,
        description,
        links,
        publicId,
        secretKey,
        assignedUsers: assignedUsers || []
    });

    try {
        const newProject = await project.save();

        // Notify Owners and Admins about the new project
        const admins = await User.find({ role: { $in: ['Owner', 'Admin'] } });
        const notifications = admins.map(admin => ({
            user: admin._id,
            title: 'New Project Created',
            message: `${newProject.name} was successfully created.`,
            type: 'success',
            link: `/project/${newProject._id}`
        }));
        await Notification.insertMany(notifications);

        res.status(201).json({ ...newProject.toObject(), secretKey });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE project (Owner/Admin or Manage-only if assigned)
router.patch('/:id', auth, requireRole(['Owner', 'Admin', 'Moderator', 'Manage-only']), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role === 'Manage-only') {
            if (!project.assignedUsers.includes(req.user.id)) {
                return res.status(403).json({ message: 'Access denied: Not assigned to manage this project' });
            }
        }

        console.log('PATCH Project ID:', req.params.id);
        console.log('PATCH Body:', JSON.stringify(req.body, null, 2));

        if (req.body.name) project.name = req.body.name;
        if (req.body.slug) project.slug = req.body.slug;
        if (req.body.category) project.category = req.body.category;
        if (req.body.description !== undefined) project.description = req.body.description;
        if (req.body.links) project.links = req.body.links;
        if (req.body.maintenanceMode !== undefined) project.maintenanceMode = req.body.maintenanceMode;
        if (req.body.customHeaders !== undefined) project.customHeaders = req.body.customHeaders;

        // Owner/Admin only fields
        if (['Owner', 'Admin'].includes(req.user.role)) {
            if (req.body.assignedUsers !== undefined) project.assignedUsers = req.body.assignedUsers;
        }

        if (req.body.clientAuth) {
            if (!project.clientAuth) project.clientAuth = {};
            if (req.body.clientAuth.enabled !== undefined) project.clientAuth.enabled = req.body.clientAuth.enabled;
            if (req.body.clientAuth.publicFields !== undefined) project.clientAuth.publicFields = req.body.clientAuth.publicFields;
        }

        project.updatedAt = Date.now();
        const updatedProject = await project.save();

        // Notify assigned users about project update
        if (project.assignedUsers && project.assignedUsers.length > 0) {
            const notifications = project.assignedUsers.map(userId => ({
                user: userId,
                title: 'Project Updated',
                message: `${project.name} has been modified.`,
                type: 'info',
                link: `/project/${project._id}`
            }));
            await Notification.insertMany(notifications);
        }

        res.json(updatedProject);
    } catch (err) {
        console.error('Project Update Error:', err);
        res.status(400).json({ message: err.message });
    }
});


// DELETE project (Owner/Admin only)
router.delete('/:id', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.deleteOne();

        // Log the action
        await new AuditLog({
            user: req.user.email,
            action: 'Deleted Project',
            target: project.name,
            iconType: 'danger'
        }).save();

        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SECURE: Reveal Secret Key
router.post('/:id/secret/reveal', auth, requireRole(['Owner', 'Admin', 'Moderator']), async (req, res) => {
    try {
        const { password } = req.body;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'samir'; // TODO: Move to shared auth config

        if (password !== ADMIN_PASSWORD) {
            // In a real app, check req.user.password if using specific users
            return res.status(401).json({ message: 'Invalid password' });
        }

        const project = await Project.findById(req.params.id).select('+secretKey');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.json({ secretKey: project.secretKey });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SECURE: Reset Secret Key
router.post('/:id/secret/reset', auth, requireRole(['Owner', 'Admin', 'Moderator']), async (req, res) => {
    try {
        const { password } = req.body;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'samir';

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Generate new secret
        const newSecret = 'sec_' + crypto.randomBytes(16).toString('hex');
        project.secretKey = newSecret;
        await project.save();

        res.json({ secretKey: newSecret });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SECURE: Generate New API Key
router.post('/:id/keys', auth, requireRole(['Owner', 'Admin', 'Moderator', 'Manage-only']), async (req, res) => {
    try {
        const { name, scopes } = req.body;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'samir';

        if (req.body.password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role === 'Manage-only') {
            if (!project.assignedUsers.includes(req.user.id)) {
                return res.status(403).json({ message: 'Access denied: You are not assigned to manage this project' });
            }
        }

        // Generate Key
        const apiKey = 'sk-' + crypto.randomBytes(24).toString('hex');

        const newKeyEntry = {
            name,
            key: apiKey,
            scopes: scopes || ['read'],
            createdAt: Date.now()
        };

        project.apiKeys.push(newKeyEntry);
        await project.save();

        // Return the saved key (with _id)
        res.status(201).json(project.apiKeys[project.apiKeys.length - 1]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SECURE: Revoke API Key
router.delete('/:id/keys/:keyId', auth, requireRole(['Owner', 'Admin', 'Moderator', 'Manage-only']), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role === 'Manage-only') {
            if (!project.assignedUsers.includes(req.user.id)) {
                return res.status(403).json({ message: 'Access denied: You are not assigned to manage this project' });
            }
        }

        project.apiKeys = project.apiKeys.filter(k => k._id.toString() !== req.params.keyId);
        await project.save();

        res.json({ message: 'API Key revoked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
