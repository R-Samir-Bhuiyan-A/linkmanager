const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    role: { type: String, enum: ['Owner', 'Editor', 'Viewer'], default: 'Viewer' },
    status: { type: String, enum: ['Active', 'Invited', 'Suspended'], default: 'Invited' },
    lastActive: { type: Date },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
