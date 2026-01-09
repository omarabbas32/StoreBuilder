const AuthService = require('../services/auth.service');

class AuthController {
    async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json(result); // result is { user, token }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.json(result); // result is { user, token }
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async verifyEmail(req, res) {
        try {
            const { token } = req.query;
            await AuthService.verifyEmail(token);
            res.json({ message: 'Email verified successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await AuthService.forgotPassword(email);
            res.json({ message: 'If that email exists, a reset link has been sent' });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).json({ error: 'Failed to process request' });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            await AuthService.resetPassword(token, password);
            res.json({ message: 'Password has been reset successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async logout(req, res) {
        res.json({ message: 'Logged out' });
    }


    async getMe(req,res){
        try {
            const user = await AuthService.getMe(req.user.id);
            res.json(user);
        } catch (error) {
            console.error('Error in getMe:', error);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();
