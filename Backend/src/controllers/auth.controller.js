const AuthService = require('../services/auth.service');
const response = require('../utils/response');

class AuthController {
    async register(req, res, next) {
        try {
            const result = await AuthService.register(req.body);
            return response.success(res, result, 'User registered successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            return response.success(res, result, 'Logged in successfully');
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            await AuthService.verifyEmail(token);
            return response.success(res, null, 'Email verified successfully');
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            await AuthService.forgotPassword(email);
            return response.success(res, null, 'If that email exists, a reset link has been sent');
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            await AuthService.resetPassword(token, password);
            return response.success(res, null, 'Password has been reset successfully');
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res) {
        return response.success(res, null, 'Logged out');
    }

    async getMe(req, res, next) {
        try {
            const user = await AuthService.getMe(req.user.id);
            return response.success(res, user);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
