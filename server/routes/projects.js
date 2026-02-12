const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const crypto = require('crypto');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ updatedAt: -1 });
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
    const { name, slug } = req.body;

    // Generate keys
    const publicId = 'pub_' + crypto.randomBytes(8).toString('hex');
    const secretKey = 'sec_' + crypto.randomBytes(16).toString('hex');

    const project = new Project({
        name,
        slug,
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

        if (req.body.name) project.name = req.body.name;
        if (req.body.slug) project.slug = req.body.slug;
        if (req.body.maintenanceMode !== undefined) project.maintenanceMode = req.body.maintenanceMode;

        project.updatedAt = Date.now();

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await project.deleteOne();
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
