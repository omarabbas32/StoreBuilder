const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const AppError = require('../utils/AppError');

/**
 * GoogleOAuthService - Handles Google OAuth flow
 * 
 * Business Rules:
 * - Validate ID token from Google
 * - Create or update user based on Google account
 * - Support both customer and owner roles
 */
console.log('[DEBUG_OAUTH] File loaded');

class GoogleOAuthService {
    constructor({ userModel, storeModel, emailService }) {
        console.log('[DEBUG_OAUTH] Constructor called');
        this.userModel = userModel;
        this.storeModel = storeModel;
        this.emailService = emailService;

        console.log('[DEBUG_OAUTH] Initializing with:');
        console.log(`  Client ID: "${process.env.GOOGLE_CLIENT_ID}" (Length: ${process.env.GOOGLE_CLIENT_ID?.length})`);
        console.log(`  Client Secret: "${process.env.GOOGLE_CLIENT_SECRET?.substring(0, 7)}...${process.env.GOOGLE_CLIENT_SECRET?.slice(-5)}" (Length: ${process.env.GOOGLE_CLIENT_SECRET?.length})`);
        console.log(`  Callback URL: "${process.env.GOOGLE_CALLBACK_URL}" (Length: ${process.env.GOOGLE_CALLBACK_URL?.length})`);

        this.client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID?.trim(),
            process.env.GOOGLE_CLIENT_SECRET?.trim(),
            process.env.GOOGLE_CALLBACK_URL?.trim()
        );
    }

    /**
     * Get Google OAuth2 URL
     * @param {string} role - 'customer' or 'owner'
     * @returns {string} Authorization URL
     */
    getAuthUrl(role = 'customer') {
        const scopes = ['profile', 'email'];
        const state = Buffer.from(JSON.stringify({ role, timestamp: Date.now() })).toString('base64');

        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            state: state,
            prompt: 'consent'
        });
    }

    /**
     * Handle Google OAuth callback
     * @param {string} code - Authorization code from Google
     * @param {string} role - 'customer' or 'owner'
     * @returns {object} User and token
     */
    async handleCallback(code, role = 'customer') {
        try {
            // Exchange code for tokens
            const { tokens } = await this.client.getToken(code);
            this.client.setCredentials(tokens);

            // Verify and decode token
            const ticket = await this.client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const { email, name, sub } = payload;

            // Check if user exists
            let user = await this.userModel.findByEmail(email);

            if (!user) {
                // Create new user
                user = await this.userModel.create({
                    email,
                    name: name || email.split('@')[0],
                    password: '', // Google OAuth users don't have a password
                    role: role || 'customer',
                    is_verified: true, // Google verifies email
                    google_id: sub
                });

                // If registering as owner, auto-create a store
                if (role === 'owner' && user && user.id) {
                    const storeName = name ? `${name}'s Store` : `Store`;
                    const slug = `${email.split('@')[0]}-${sub.substring(0, 8)}`.toLowerCase();

                    try {
                        await this.storeModel.create({
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

                // Send welcome email
                this.emailService?.sendWelcomeEmail(user).catch(err => {
                    console.error('Failed to send welcome email:', err);
                });
            } else {
                // Update existing user with google_id if not set
                if (!user.google_id) {
                    user = await this.userModel.update(user.id, {
                        google_id: sub
                    });
                }
            }

            // Remove password from response
            delete user.password;

            return { user, tokens };
        } catch (error) {
            if (error.response) {
                console.error('Google OAuth detailed error:', error.response.data);
            } else {
                console.error('Google OAuth error:', error);
            }
            throw new AppError('Failed to authenticate with Google', 401);
        }
    }

    /**
     * Verify token without callback
     * @param {string} idToken - Google ID token
     * @returns {object} Token payload
     */
    async verifyToken(idToken) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            return ticket.getPayload();
        } catch (error) {
            throw new AppError('Invalid Google token', 401);
        }
    }
}

module.exports = GoogleOAuthService;
