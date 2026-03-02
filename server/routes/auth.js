const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
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

// Replaced with emailService

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
            const resetUrl = `${process.env.FRONTEND_URL || req.headers.origin}/reset-password?token=${token}`;

            const htmlTemplate = `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #e4e4e7; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05)); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="width: 60px; height: 60px; margin: 0 auto 20px auto; background: linear-gradient(135deg, #8b5cf6, #06b6d4); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">
                            <span style="color: white; font-size: 28px; font-weight: bold;">⬡</span>
                        </div>
                        <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700; tracking: tight;">Password Recovery</h1>
                    </div>
                    
                    <div style="padding: 40px 30px; background-color: rgba(0,0,0,0.2);">
                        <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px; margin-top: 0;">You have requested to reset the password for your OT-Dashboard account.</p>
                        <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">Please click the secure button below to establish a new credential format:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">Reset Credentials</a>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-top: 30px;">
                            <p style="font-size: 13px; color: #71717a; margin-top: 0; margin-bottom: 8px;">Or copy and paste this secure link into your browser:</p>
                            <p style="font-size: 13px; color: #a1a1aa; word-break: break-all; margin: 0; font-family: monospace;">${resetUrl}</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #000; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-size: 13px; color: #52525b; margin: 0;">If you did not initiate this request, you may safely ignore this automated transmission. Your current credentials will remain intact.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: 'OT-Dashboard - Password Reset Request',
                text: `You have requested a password reset. Please click on the following link or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
                html: htmlTemplate
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
        user.status = 'Active'; // Activate the user if they were in 'Invited' status
        await user.save();

        res.json({ message: 'Password has been updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
