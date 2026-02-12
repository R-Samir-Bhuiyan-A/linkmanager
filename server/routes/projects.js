const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const crypto = require('crypto');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().select('+secretKey').sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE project
router.post('/', async (req, res) => {
    const { name, slug, category, description, links } = req.body;

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
        secretKey
    });

    try {
        const newProject = await project.save();
        // Return secret key only once on creation
        res.status(201).json({ ...newProject.toObject(), secretKey });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE project
router.patch('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        console.log('PATCH Project ID:', req.params.id);
        console.log('PATCH Body:', JSON.stringify(req.body, null, 2));

        if (req.body.name) project.name = req.body.name;
        if (req.body.slug) project.slug = req.body.slug;
        if (req.body.category) project.category = req.body.category;
        if (req.body.description !== undefined) project.description = req.body.description;
        if (req.body.links) project.links = req.body.links;
        if (req.body.maintenanceMode !== undefined) project.maintenanceMode = req.body.maintenanceMode;
        if (req.body.maintenanceMode !== undefined) project.maintenanceMode = req.body.maintenanceMode;
        if (req.body.clientAuth) {
            // Safer update: Explicitly set fields to avoid spreading unknown properties or _id
            if (!project.clientAuth) project.clientAuth = {};
            if (req.body.clientAuth.enabled !== undefined) project.clientAuth.enabled = req.body.clientAuth.enabled;
            if (req.body.clientAuth.publicFields !== undefined) project.clientAuth.publicFields = req.body.clientAuth.publicFields;
        }

        // Team Management Routes (Embedded logic for now)
        if (req.body.addMember) {
            const { userId, role } = req.body.addMember;
            // Check if user exists
            // For MVP, just push to array if not already there
            const exists = project.members.find(m => m.userId.toString() === userId);
            if (!exists) {
                project.members.push({ userId, role });
            }
        }

        if (req.body.removeMember) {
            const { userId } = req.body.removeMember;
            project.members = project.members.filter(m => m.userId.toString() !== userId);
        }

        project.updatedAt = Date.now();

        const updatedProject = await project.save();
        console.log('Updated Project clientAuth:', JSON.stringify(updatedProject.clientAuth, null, 2));

        // Populate user info for response
        await updatedProject.populate('members.userId', 'name email');

        res.json(updatedProject);
    } catch (err) {
        console.error('Project Update Error:', err);
        res.status(400).json({ message: err.message });
    }
});

const AuditLog = require('../models/AuditLog');

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.deleteOne();

        // Log the action
        await new AuditLog({
            user: 'Admin', // TODO: Get from auth token
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
router.post('/:id/secret/reveal', async (req, res) => {
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
router.post('/:id/secret/reset', async (req, res) => {
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

module.exports = router;
