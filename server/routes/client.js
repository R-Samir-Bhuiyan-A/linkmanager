const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Config = require('../models/Config');
const Instance = require('../models/Instance');
const AccessRule = require('../models/AccessRule');

// Helper to check version requirements (simple semantic version check could be added here)
const isVersionAllowed = (current, min) => {
    if (!current || !min) return true;
    // Simple check: current >= min. Real implementation might need semver lib.
    // For now, assume string comparison implies lexicographical, which is naive but okay for starters.
    // Better: use 'semver' package. But I didn't install it. 
    // Let's just do direct comparison or simple split.
    // I'll stick to string comparison for now to keep it dependency-lite, or assume standard format.
    return current.localeCompare(min, undefined, { numeric: true, sensitivity: 'base' }) >= 0;
};

// GET /config/:publicId
router.get('/config/:publicId', async (req, res) => {
    const { publicId } = req.params;
    const {
        env = 'prod',
        version,
        instanceId,
        hardwareId
    } = req.query;

    // 1. Find Project
    const project = await Project.findOne({ publicId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 2. Check Maintenance
    if (project.maintenanceMode) {
        return res.status(503).json({
            error: 'Maintenance mode',
            maintenance: true
        });
    }

    // 3. Access Control
    const rules = await AccessRule.find({ projectId: project._id, isActive: true });
    let blocked = false;
    let blockReason = null;
    let blockMessage = null;

    for (const rule of rules) {
        if (rule.action === 'block') {
            if (rule.type === 'version' && version === rule.value) { blocked = true; blockReason = rule.reason; blockMessage = rule.message; break; }
            if (rule.type === 'ip' && req.ip === rule.value) { blocked = true; blockReason = rule.reason; blockMessage = rule.message; break; }
            if (rule.type === 'instanceId' && instanceId === rule.value) { blocked = true; blockReason = rule.reason; blockMessage = rule.message; break; }
            if (rule.type === 'hardwareId' && hardwareId === rule.value) { blocked = true; blockReason = rule.reason; blockMessage = rule.message; break; }
        }
    }

    if (blocked) {
        return res.status(403).json({
            error: 'Access denied',
            reason: blockReason,
            message: blockMessage
        });
    }

    // 4. Version Check
    const updateRequired = !isVersionAllowed(version, project.minVersion);

    // 5. Fetch Configs for Environment
    const configs = await Config.find({
        projectId: project._id,
        environment: env,
        isEnabled: true
    });

    const configMap = {};
    configs.forEach(c => configMap[c.key] = c.value);

    res.json({
        config: configMap,
        project: {
            name: project.name,
            latestVersion: project.latestVersion,
            minVersion: project.minVersion,
            updateUrl: project.updateUrl,
            updateRequired
        }
    });
});

// POST /heartbeat/:publicId
router.post('/heartbeat/:publicId', async (req, res) => {
    const { publicId } = req.params;
    const { instanceId, hardwareId, platform, version } = req.body;

    if (!instanceId) return res.status(400).json({ error: 'instanceId required' });

    const project = await Project.findOne({ publicId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Update or Create Instance
    await Instance.findOneAndUpdate(
        { projectId: project._id, instanceId },
        {
            projectId: project._id,
            instanceId,
            hardwareId,
            platform,
            version,
            ip: req.ip,
            lastHeartbeat: Date.now(),
            $inc: { requestCount: 1 }
        },
        { upsert: true }
    );

    res.json({ status: 'ok' });
});

module.exports = router;
