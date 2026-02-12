const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const Instance = require('../models/Instance');
const DailyStats = require('../models/DailyStats');

// GET /api/analytics/stats
router.get('/stats', async (req, res) => {
    try {
        const totalInstances = await Instance.countDocuments();
        const instances = await Instance.find();
        const totalRequests = instances.reduce((acc, curr) => acc + (curr.requestCount || 0), 0);

        // Aggregate Traffic Volume (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await DailyStats.find({
            date: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
        }).sort({ date: 1 });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = [];
        const trafficVolume = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];

            days.push(dayNames[d.getDay()]);

            const stat = dailyStats.find(s => s.date === dateStr);
            trafficVolume.push(stat ? stat.requests : 0);
        }

        // Aggregate Device Distribution
        const platforms = await Instance.aggregate([
            { $group: { _id: "$platform", count: { $sum: 1 } } }
        ]);

        const totalPlatformCount = platforms.reduce((acc, curr) => acc + curr.count, 0) || 1;
        const deviceDistribution = platforms.map(p => ({
            label: p._id || 'Unknown',
            val: Math.round((p.count / totalPlatformCount) * 100),
            color: p._id === 'ios' ? 'bg-indigo-500' :
                p._id === 'android' ? 'bg-emerald-500' :
                    p._id === 'web' ? 'bg-amber-500' : 'bg-rose-500'
        }));

        if (deviceDistribution.length === 0) {
            deviceDistribution.push(
                { label: 'No Data', val: 0, color: 'bg-zinc-700' }
            );
        }

        res.json({
            totalRequests,
            activeInstances: totalInstances,
            avgLatency: 45, // Placeholder
            globalRegions: 1,
            trafficHistory: {
                labels: days,
                data: trafficVolume
            },
            deviceDistribution
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/analytics/audit
router.get('/audit', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/analytics/audit (Internal use)
router.post('/audit', async (req, res) => {
    try {
        const log = new AuditLog(req.body);
        await log.save();
        res.status(201).json(log);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
