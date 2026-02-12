const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'Eksses API Manager' },
    adminEmail: { type: String, default: 'admin@example.com' },
    maintenanceMode: { type: Boolean, default: false },
    smtp: {
        host: { type: String, default: '' },
        port: { type: Number, default: 587 },
        user: { type: String, default: '' },
        pass: { type: String, default: '' },
        secure: { type: Boolean, default: false }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        ipWhitelist: { type: Boolean, default: false },
        whitelistedIps: [{ type: String }]
    },
    backups: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, default: 'daily' }, // daily, weekly
        retentionDays: { type: Number, default: 7 },
        lastBackup: { type: Date }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
