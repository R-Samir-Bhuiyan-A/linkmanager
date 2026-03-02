const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Config = require('../models/Config');
const Instance = require('../models/Instance');
const AccessRule = require('../models/AccessRule');
const License = require('../models/License');
const tracker = require('../middleware/tracker');
const apiLogger = require('../middleware/apiLogger');

router.use(tracker);
router.use(apiLogger);

// Helper to check version requirements
const isVersionAllowed = (current, min) => {
    if (!current || !min) return true;
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

    try {
        // 1. Find Project (include secretKey for auth check)
        const project = await Project.findOne({ publicId }).select('+secretKey');
        if (!project) return res.status(404).json({ error: 'Project not found' });
        req.projectId = project._id;

        // 2. Check Maintenance
        if (project.maintenanceMode) {
            return res.status(503).json({
                error: 'Maintenance mode',
                maintenance: true,
                message: 'System under maintenance'
            });
        }

        // 3. Access Control (Block Lists)
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

        // 5. Build Response Data
        let responseData = {
            project: {
                name: project.name,
                latestVersion: project.latestVersion,
                minVersion: project.minVersion,
                updateUrl: project.updateUrl,
                updateRequired
            },
            config: {}
        };

        // Fetch Configs
        const configs = await Config.find({
            projectId: project._id,
            environment: env,
            isEnabled: true
        });

        configs.forEach(c => responseData.config[c.key] = c.value);

        // 6. CLIENT AUTHENTICATION LOGIC
        if (project.clientAuth && project.clientAuth.enabled) {
            const clientId = req.headers['x-client-id'];
            const secret = req.headers['x-secret'];

            // 1. Check Master Key
            let isAuthenticated = (clientId === project.publicId) && (secret === project.secretKey);
            let activeScope = 'admin'; // Master key has full access

            // 2. Check API Keys if not validated yet
            if (!isAuthenticated && project.apiKeys && project.apiKeys.length > 0) {
                // Find matching key
                // Note: In real app, we might hash this. Here we compare direct strings for MVP.
                const matchedKey = project.apiKeys.find(k => k.key === secret);
                if (matchedKey && clientId === project.publicId) {
                    isAuthenticated = true;
                    // Update last used (async, don't await/block)
                    matchedKey.lastUsed = Date.now();
                    project.save({ validateBeforeSave: false }).catch(err => console.error('Failed to update lastUsed', err));
                }
            }

            if (!isAuthenticated) {
                // Filter response to ONLY public fields
                const publicFields = project.clientAuth.publicFields || [];
                const filteredResponse = { project: {}, config: {} };

                // Filter Project Fields
                Object.keys(responseData.project).forEach(key => {
                    if (publicFields.includes(key)) filteredResponse.project[key] = responseData.project[key];
                });

                // Filter Config Fields
                Object.keys(responseData.config).forEach(key => {
                    if (publicFields.includes(key)) filteredResponse.config[key] = responseData.config[key];
                });

                return res.json(filteredResponse);
            }
        }

        // If Auth Disabled OR Auth Successful -> Return (Possibly Pruned) Data
        res.json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /heartbeat/:publicId
router.post('/heartbeat/:publicId', async (req, res) => {
    const { publicId } = req.params;
    const { instanceId, hardwareId, platform, version } = req.body;

    if (!instanceId) return res.status(400).json({ error: 'instanceId required' });

    try {
        const project = await Project.findOne({ publicId });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        req.projectId = project._id;

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
            { upsert: true, returnDocument: 'after' }
        );

        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /validate-license
router.post('/validate-license', async (req, res) => {
    const { key, hwid, publicId } = req.body;

    if (!key || !hwid || !publicId) {
        return res.status(400).json({ valid: false, message: 'Missing required fields: key, hwid, publicId' });
    }

    try {
        const project = await Project.findOne({ publicId });
        if (!project) return res.status(404).json({ valid: false, message: 'Project not found' });
        req.projectId = project._id;

        const license = await License.findOne({ key, project: project._id });
        if (!license) return res.status(403).json({ valid: false, message: 'Invalid license key' });

        if (license.status !== 'active') return res.status(403).json({ valid: false, message: 'License suspended' });
        if (license.expiresAt && new Date() > license.expiresAt) return res.status(403).json({ valid: false, message: 'License expired' });

        // HWID Logic
        if (!license.hardwareId) {
            license.hardwareId = hwid;
            await license.save();
        } else if (license.hardwareId !== hwid) {
            return res.status(403).json({ valid: false, message: 'HWID Mismatch. Key is locked to another device.' });
        }

        license.lastValidated = Date.now();
        await license.save();

        res.json({
            valid: true,
            message: 'Authorized',
            license: {
                holder: license.holderName,
                type: license.type,
                expiresAt: license.expiresAt
            }
        });
    } catch (err) {
        res.status(500).json({ valid: false, message: err.message });
    }
});

module.exports = router;
