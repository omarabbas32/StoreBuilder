const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { generateToken, generateRandomToken } = require('../utils/auth.utils');

/**
 * AuthService - Contains ALL authentication business logic
 * 
 * Business Rules:
 * - Email must be unique
 * - Password must be hashed
 * - Verification token expiry
 * - Reset token expiry (1 hour)
 */
class AuthService {
    constructor({ userModel, emailService }) {
        this.userModel = userModel;
        this.emailService = emailService;
    }

    /**
     * Register new user
     * Business Rules:
     * - Email must be unique
     * - Password must be hashed (bcrypt)
     * - Send verification email
     */
    async register(dto) {
        const { email, password, name, role } = dto;

        // Business Rule 1: Email must be unique
        const existing = await this.userModel.findByEmail(email);
        if (existing) {
            throw new AppError('User already exists with this email', 409);
        }

        // Business Rule 2: Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.userModel.create({
            email,
            password: hashedPassword,
            name,
            role: role || 'customer',
            is_verified: false
        });

        // Generate verification token
        const verificationToken = generateRandomToken();
        await this.userModel.update(user.id, {
            verification_token: verificationToken
        });

        // Send verification email (async, don't wait)
        this.emailService?.sendVerificationEmail(user, verificationToken).catch(err => {
            console.error('Failed to send verification email:', err);
        });

        // Generate JWT
        const token = generateToken({ id: user.id, role: user.role });

        // Remove password from response
        delete user.password;

        return { user, token };
    }

    /**
     * Login user
     * Business Rules:
     * - Email must exist
     * - Password must match
     */
    async login(email, password) {
        // Business Rule 1: User must exist
        const user = await this.userModel.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Business Rule 2: Password must match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate JWT
        const token = generateToken({ id: user.id, role: user.role });

        // Remove password from response
        delete user.password;

        return { user, token };
    }

    /**
     * Verify email
     * Business Rule: Token must be valid
     */
    async verifyEmail(token) {
        const user = await this.userModel.findByVerificationToken(token);
        if (!user) {
            throw new AppError('Invalid or expired verification token', 400);
        }

        const updated = await this.userModel.update(user.id, {
            is_verified: true,
            verification_token: null
        });

        return updated;
    }

    /**
     * Forgot password
     * Business Rule: Don't leak user existence
     */
    async forgotPassword(email) {
        const user = await this.userModel.findByEmail(email);
        if (!user) {
            // Don't leak user existence, but return success
            return { success: true };
        }

        // Generate reset token
        const resetToken = generateRandomToken();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await this.userModel.update(user.id, {
            reset_token: resetToken,
            reset_expires: expires
        });

        // Send reset email
        await this.emailService?.sendPasswordResetEmail(user, resetToken);

        return { success: true };
    }

    /**
     * Reset password
     * Business Rules:
     * - Token must be valid and not expired
     * - Password must be hashed
     */
    async resetPassword(token, newPassword) {
        const user = await this.userModel.findByResetToken(token);
        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userModel.update(user.id, {
            password: hashedPassword,
            reset_token: null,
            reset_expires: null
        });

        return { success: true, message: 'Password reset successfully' };
    }

    /**
     * Change password (authenticated user)
     * Business Rule: Current password must match
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userModel.update(userId, {
            password: hashedPassword
        });

        return { success: true, message: 'Password changed successfully' };
    }
}

module.exports = AuthService;
