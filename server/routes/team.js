const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth: auth } = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const { sendEmail } = require('../services/emailService');

// GET all users (Accessible to everyone to view the team, but UI actions will be restricted)
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().sort({ joinedAt: -1 }).select('-password -resetPasswordToken -resetPasswordExpires');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create user (Owner/Admin only)
router.post('/invite', auth, requireRole(['Owner', 'Admin']), async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).json({ message: 'User already exists' });

        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');

        // Generate a random secure placeholder password since the schema requires it
        const bcrypt = require('bcrypt');
        const placeholderPassword = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const autoHashedPassword = await bcrypt.hash(placeholderPassword, salt);

        const newUser = new User({
            name,
            email,
            role,
            password: autoHashedPassword,
            status: 'Invited',
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 7 * 24 * 3600000 // 7 days
        });

        await newUser.save();

        // Notify Owners and Admins
        const admins = await User.find({ role: { $in: ['Owner', 'Admin'] } });
        const notifications = admins.map(admin => ({
            user: admin._id,
            title: 'New Team Member Invited',
            message: `${newUser.name} (${newUser.email}) was invited as ${newUser.role}.`,
            type: 'info',
            link: '/team'
        }));
        await Notification.insertMany(notifications);

        // Send Invitation Email
        try {
            const resetUrl = `${process.env.FRONTEND_URL || req.headers.origin}/reset-password?token=${token}`;

            const htmlTemplate = `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #e4e4e7; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05)); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="width: 60px; height: 60px; margin: 0 auto 20px auto; background: linear-gradient(135deg, #8b5cf6, #06b6d4); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">
                            <span style="color: white; font-size: 28px; font-weight: bold;">⬡</span>
                        </div>
                        <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700; tracking: tight;">OT-Dashboard</h1>
                    </div>
                    
                    <div style="padding: 40px 30px; background-color: rgba(0,0,0,0.2);">
                        <h2 style="color: #fff; margin-top: 0; font-size: 20px;">Welcome, ${newUser.name}</h2>
                        <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">You have been invited to join the <strong>OT-Dashboard Control Plane</strong> with the rank of <span style="color: #c084fc; font-weight: 600;">${newUser.role}</span>.</p>
                        <p style="color: #a1a1aa; line-height: 1.6; font-size: 15px;">To securely access your account and the ecosystem, please initialize your credentials by clicking the button below:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);">Initialize Credentials</a>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-top: 30px;">
                            <p style="font-size: 13px; color: #71717a; margin-top: 0; margin-bottom: 8px;">Or copy and paste this secure link into your browser:</p>
                            <p style="font-size: 13px; color: #a1a1aa; word-break: break-all; margin: 0; font-family: monospace;">${resetUrl}</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #000; padding: 24px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-size: 13px; color: #52525b; margin: 0;">This invitation link will expire in 7 days for security purposes.</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: newUser.email,
                subject: 'Action Required: You have been invited to OT-Dashboard',
                text: `Hello ${newUser.name},\n\nYou have been invited to join OT-Dashboard as an ${newUser.role}.\n\nPlease set your password by visiting this link: ${resetUrl}\n\nWelcome aboard!`,
                html: htmlTemplate
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
