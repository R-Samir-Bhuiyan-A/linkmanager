const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

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

/**
 * Sends an email using the global SMTP configuration
 * @param {Object} options - { to, subject, text, html }
 */
async function sendEmail(options) {
    const transporter = await getTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"OT-Dashboard" <noreply@ot-dashboard.local>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = {
    getTransporter,
    sendEmail
};
