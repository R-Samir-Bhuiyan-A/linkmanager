const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // Format: PRO-XXXX-XXXX-XXXX
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    holderName: { type: String, required: true },
    email: { type: String, required: true },
    type: {
        type: String,
        enum: ['lifetime', 'subscription', 'trial'],
        default: 'lifetime'
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'expired'],
        default: 'active'
    },
    hardwareId: { type: String, default: null }, // Locked on first use
    expiresAt: { type: Date },
    lastValidated: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('License', LicenseSchema);
