const mongoose = require('mongoose');

const AccessRuleSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: ['version', 'ip', 'instanceId', 'hardwareId'], required: true },
    value: { type: String, required: true }, // The version string, IP address, etc.
    condition: { type: String, enum: ['equals', 'contains', 'gte', 'lte'], default: 'equals' }, // For versions mainly
    action: { type: String, enum: ['block', 'allow'], required: true },
    reason: { type: String, required: true }, // 'update_required', 'maintenance', 'blacklisted'
    message: { type: String }, // User facing message
    expiresAt: { type: Date }, // Optional expiry
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessRule', AccessRuleSchema);
