const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Moderator', 'Manage-only', 'View-only'], default: 'View-only' },
    status: { type: String, enum: ['Active', 'Invited', 'Suspended'], default: 'Active' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastActive: { type: Date },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
