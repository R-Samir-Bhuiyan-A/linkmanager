const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Auto-bootstrap Owner account if DB is empty
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log("No users in DB. Bootstrapping initial Owner account...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
            await User.create({
                name: 'Administrator',
                email: ADMIN_USERNAME, // We use the ENV username as email for login sake
                password: hashedPassword,
                role: 'Owner',
                status: 'Active'
            });
        }

        const user = await User.findOne({ email: username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'Active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        user.lastActive = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /me
router.get('/me', requireAuth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Setup Nodemailer transporter from Settings
async function getTransporter() {
    const settings = await Settings.findOne();
    if (!settings || !settings.smtp || !settings.smtp.host) {
        throw new Error('SMTP not configured in settings');
    }
    return nodemailer.createTransport({
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: settings.smtp.secure,
        auth: {
            user: settings.smtp.user,
            pass: settings.smtp.pass
        }
    });
}

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        try {
            const transporter = await getTransporter();
            const resetUrl = `${process.env.FRONTEND_URL || req.headers.origin}/reset-password?token=${token}`;
            
            await transporter.sendMail({
                from: process.env.EMAIL_FROM || '"OT-Dashboard" <noreply@ot-dashboard.local>',
                to: user.email,
                subject: 'Password Reset Request',
                text: `You have requested a password reset. Please click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`
            });
            res.json({ message: 'Password reset link sent to your email.' });
        } catch (emailErr) {
            console.error("SMTP error:", emailErr);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Failed to send reset email. Check SMTP settings.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
