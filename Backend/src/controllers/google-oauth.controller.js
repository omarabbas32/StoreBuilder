const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../utils/auth.utils');
const UserResponseDTO = require('../dtos/user/UserResponse.dto');

class GoogleOAuthController {
    constructor(googleOAuthService) {
        this.googleOAuthService = googleOAuthService;
    }

    /**
     * Get Google OAuth URL for customer registration
     */
    getCustomerAuthUrl = asyncHandler(async (req, res) => {
        const authUrl = this.googleOAuthService.getAuthUrl('customer');
        res.status(200).json({
            success: true,
            data: { authUrl }
        });
    });

    /**
     * Get Google OAuth URL for owner registration
     */
    getOwnerAuthUrl = asyncHandler(async (req, res) => {
        const authUrl = this.googleOAuthService.getAuthUrl('owner');
        res.status(200).json({
            success: true,
            data: { authUrl }
        });
    });

    /**
     * Handle Google OAuth callback for customer
     */
    customerCallback = asyncHandler(async (req, res) => {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`http://localhost:5173/auth/callback?error=missing_code`);
        }

        try {
            const { user, tokens } = await this.googleOAuthService.handleCallback(code, 'customer');

            // Generate JWT
            const jwtToken = generateToken({ id: user.id, role: user.role });

            // Redirect to frontend callback with token in URL
            const userData = encodeURIComponent(JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }));

            res.redirect(`http://localhost:5173/auth/callback?token=${jwtToken}&user=${userData}&role=customer`);
        } catch (error) {
            console.error('Customer OAuth callback error:', error);
            res.redirect(`http://localhost:5173/auth/callback?error=${encodeURIComponent(error.message)}`);
        }
    });

    /**
     * Handle Google OAuth callback for owner
     */
    ownerCallback = asyncHandler(async (req, res) => {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`http://localhost:5173/auth/callback?error=missing_code`);
        }

        try {
            const { user, tokens } = await this.googleOAuthService.handleCallback(code, 'owner');

            // Generate JWT
            const jwtToken = generateToken({ id: user.id, role: user.role });

            // Redirect to frontend callback with token in URL
            const userData = encodeURIComponent(JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }));

            res.redirect(`http://localhost:5173/auth/callback?token=${jwtToken}&user=${userData}&role=owner`);
        } catch (error) {
            console.error('Owner OAuth callback error:', error);
            res.redirect(`http://localhost:5173/auth/callback?error=${encodeURIComponent(error.message)}`);
        }
    });

    /**
     * Generic Google OAuth callback handler
     * Uses state parameter to determine role
     */
    handleCallback = asyncHandler(async (req, res) => {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect(`http://localhost:5173/auth/callback?error=missing_code`);
        }

        let role = 'customer'; // Default role
        if (state) {
            try {
                const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
                if (decodedState.role) {
                    role = decodedState.role;
                }
            } catch (err) {
                console.error('Failed to parse OAuth state:', err);
            }
        }

        try {
            const { user, tokens } = await this.googleOAuthService.handleCallback(code, role);

            // Generate JWT
            const jwtToken = generateToken({ id: user.id, role: user.role });

            // Redirect to frontend callback with token in URL
            const userData = encodeURIComponent(JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }));

            res.redirect(`http://localhost:5173/auth/callback?token=${jwtToken}&user=${userData}&role=${role}`);
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`http://localhost:5173/auth/callback?error=${encodeURIComponent(error.message)}`);
        }
    });

    /**
     * Verify Google token directly (for frontend sending token)
     */
    verifyToken = asyncHandler(async (req, res) => {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token required'
            });
        }

        try {
            const payload = await this.googleOAuthService.verifyToken(idToken);
            const { email, name, sub } = payload;

            // Find or create user
            const userModel = require('../models/user.model');
            let user = await userModel.findByEmail(email);

            if (!user) {
                user = await userModel.create({
                    email,
                    name: name || email.split('@')[0],
                    password: '',
                    role: role || 'customer',
                    is_verified: true,
                    google_id: sub
                });

                // If owner role, create store
                if (role === 'owner' && user && user.id) {
                    const storeModel = require('../models/store.model');
                    const storeName = name ? `${name}'s Store` : `Store`;
                    const slug = `${email.split('@')[0]}-${sub.substring(0, 8)}`.toLowerCase();
                    try {
                        await storeModel.create({
                            owner_id: user.id,
                            name: storeName,
                            slug: slug,
                            description: '',
                            contact_email: email
                        });
                    } catch (err) {
                        console.error('Failed to create store:', err);
                    }
                }
            } else if (!user.google_id) {
                user = await userModel.update(user.id, { google_id: sub });
            }

            delete user.password;

            // Generate JWT
            const jwtToken = require('../utils/auth.utils').generateToken({ id: user.id, role: user.role });

            res.status(200).json({
                success: true,
                data: {
                    user: new UserResponseDTO(user),
                    token: jwtToken
                }
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Google token'
            });
        }
    });
}

module.exports = GoogleOAuthController;
