const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmailService = require('./email.service');
const { generateToken, generateRandomToken } = require('../utils/auth.utils');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

class AuthService {
    async register(userData) {
        const existing = await User.findByEmail(userData.email);
        if (existing) throw new ValidationError('User already exists with this email');

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await User.create({
            ...userData,
            password: hashedPassword
        });

        // Generate verification token
        const verificationToken = generateRandomToken();
        await User.updateVerificationToken(user.id, verificationToken);

        // Send verification email (async)
        EmailService.sendVerificationEmail(user, verificationToken).catch(err => {
            console.error('Failed to send verification email:', err);
        });

        // Generate JWT
        const token = generateToken({ id: user.id, role: user.role });

        return { user, token };
    }

    async login(email, password) {
        const user = await User.findByEmail(email);
        if (!user) throw new UnauthorizedError('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedError('Invalid email or password');

        // Generate JWT
        const token = generateToken({ id: user.id, role: user.role });

        // Remove password from user object
        delete user.password;

        return { user, token };
    }

    async verifyEmail(token) {
        const user = await User.verifyEmail(token);
        if (!user) throw new ValidationError('Invalid or expired verification token');
        return user;
    }

    async forgotPassword(email) {
        const user = await User.findByEmail(email);
        if (!user) return; // Don't leak user existence

        const resetToken = generateRandomToken();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await User.setResetToken(email, resetToken, expires);
        await EmailService.sendPasswordResetEmail(user, resetToken);
    }

    async resetPassword(token, newPassword) {
        const user = await User.findByResetToken(token);
        if (!user) throw new ValidationError('Invalid or expired reset token');

        // Hash the new password before saving it to DB
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(user.id, hashedPassword);
    }
}

module.exports = new AuthService();
