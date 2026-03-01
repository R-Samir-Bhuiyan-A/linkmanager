const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth: auth } = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const { sendEmail } = require('../services/emailService');

// GET all users (Owner/Admin only)
router.get('/', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        const users = await User.find().sort({ joinedAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create user (Owner/Admin only)
router.post('/invite', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({
            name,
            email,
            role,
            password, // Password validation handled by pre-save hook
            status: 'Active'
        });

        await newUser.save();

        // Notify Owners and Admins
        const admins = await User.find({ role: { $in: ['Owner', 'Admin'] } });
        const notifications = admins.map(admin => ({
            user: admin._id,
            title: 'New Team Member',
            message: `${newUser.name} (${newUser.email}) joined as ${newUser.role}.`,
            type: 'info',
            link: '/team'
        }));
        await Notification.insertMany(notifications);

        // Send Invitation Email
        try {
            const loginUrl = `${process.env.FRONTEND_URL || req.headers.origin}/login`;
            await sendEmail({
                to: newUser.email,
                subject: 'You have been invited to OT-Dashboard',
                text: `Hello ${newUser.name},\n\nYou have been invited to join OT-Dashboard as an ${newUser.role}.\n\nYour temporary password is: ${password}\n\nPlease log in at ${loginUrl} and change your password immediately.\n\nWelcome aboard!`
            });
        } catch (emailErr) {
            console.error('Failed to send invitation email:', emailErr);
            // We usually do not fail the overall request if strictly the email fails,
            // but log the error appropriately.
        }

        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE user (Owner/Admin only)
router.delete('/:id', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();

        // Notify Owners and Admins
        const admins = await User.find({ role: { $in: ['Owner', 'Admin'] } });
        const notifications = admins.map(admin => ({
            user: admin._id,
            title: 'Team Member Removed',
            message: `${user.name} was removed from the system.`,
            type: 'warning',
            link: '/team'
        }));
        await Notification.insertMany(notifications);

        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
