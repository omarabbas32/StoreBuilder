const nodemailer = require('nodemailer');
const AppError = require('../utils/AppError');

/**
 * EmailService - Email sending service
 * 
 * Handles all email communications via Nodemailer
 */
class EmailService {
    constructor(config = {}) {
        const {
            host = process.env.MAIL_HOST,
            port = parseInt(process.env.MAIL_PORT || '587'),
            user = process.env.MAIL_USER,
            pass = process.env.MAIL_PASS,
            from = process.env.MAIL_FROM || user
        } = config;

        this.from = from;
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass }
            });
        } else {
            console.warn('[EmailService] Email not configured. Emails will not be sent.');
            this.transporter = null;
        }
    }

    /**
     * Send generic email
     */
    async sendEmail(to, subject, html) {
        if (!this.transporter) {
            console.log(`[EmailService] Would send email to ${to}: ${subject}`);
            return { success: false, message: 'Email not configured' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"Storely" <${this.from}>`,
                to,
                subject,
                html
            });

            console.log(`[EmailService] Email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            throw new AppError('Failed to send email', 500);
        }
    }

    /**
     * Send email verification
     */
    async sendVerificationEmail(user, token) {
        const url = `${this.frontendUrl}/verify-email?token=${token}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Welcome to Storely!</h1>
                <p>Hi ${user.name || 'there'},</p>
                <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Verify Email</a>
                <p>Or copy this link: ${url}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The Storely Team</p>
            </div>
        `;

        return this.sendEmail(user.email, 'Verify your email - Storely', html);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, token) {
        const url = `${this.frontendUrl}/reset-password?token=${token}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Password Reset Request</h1>
                <p>Hi ${user.name || 'there'},</p>
                <p>You requested a password reset. Click the button below to set a new password:</p>
                <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
                <p>Or copy this link: ${url}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The Storely Team</p>
            </div>
        `;

        return this.sendEmail(user.email, 'Password Reset - Storely', html);
    }

    /**
     * Send order confirmation
     */
    async sendOrderConfirmation(user, order) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Order Confirmation</h1>
                <p>Hi ${user.name || order.customer_name},</p>
                <p>Thank you for your order!</p>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Total:</strong> $${order.total_amount}</p>
                <p>We'll send you another email when your order ships.</p>
                <p>Best regards,<br>The Storely Team</p>
            </div>
        `;

        return this.sendEmail(order.customer_email, 'Order Confirmation - Storely', html);
    }
}

module.exports = EmailService;
