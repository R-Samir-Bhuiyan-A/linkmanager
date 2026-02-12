
// POST /validate-license
router.post('/validate-license', [tracker], async (req, res) => {
    const { key, hwid, publicId } = req.body;

    if (!key || !hwid || !publicId) {
        return res.status(400).json({ valid: false, message: 'Missing required fields: key, hwid, publicId' });
    }

    try {
        const project = await Project.findOne({ publicId });
        if (!project) return res.status(404).json({ valid: false, message: 'Project not found' });

        const license = await License.findOne({ key, project: project._id });
        if (!license) return res.status(403).json({ valid: false, message: 'Invalid license key' });

        // Checks
        if (license.status !== 'active') return res.status(403).json({ valid: false, message: 'License suspended' });
        if (license.expiresAt && new Date() > license.expiresAt) return res.status(403).json({ valid: false, message: 'License expired' });

        // HWID Logic
        if (!license.hardwareId) {
            // First use -> Lock it
            license.hardwareId = hwid;
            await license.save(); // Save lock
        } else if (license.hardwareId !== hwid) {
            // Mismatch
            return res.status(403).json({ valid: false, message: 'HWID Mismatch. Key is locked to another device.' });
        }

        // Success
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
