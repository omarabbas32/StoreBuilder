const nodemailer = require('nodemailer');
const { mail } = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: mail.host,
            port: mail.port,
            secure: mail.port === 465, // true for 465, false for other ports
            auth: {
                user: mail.user,
                pass: mail.pass,
            },
        });
    }

    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Storely" <${mail.user}>`,
                to,
                subject,
                html,
            });
            logger.info(`Message sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(user, token) {
        const url = `http://localhost:3000/api/auth/verify-email?token=${token}`;
        const html = `
            <h1>Welcome to Storely!</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${url}">Verify Email</a>
        `;
        return this.sendEmail(user.email, 'Verify your email - Storely', html);
    }

    async sendPasswordResetEmail(user, token) {
        const url = `http://localhost:3000/api/auth/reset-password?token=${token}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${url}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
        `;
        return this.sendEmail(user.email, 'Password Reset - Storely', html);
    }
}

module.exports = new EmailService();
