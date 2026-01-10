const StoreService = require('../services/store.service');
const { NotFoundError } = require('../utils/errors');

/**
 * Middleware to extract subdomain and identify the tenant (Store)
 */
const tenantMiddleware = async (req, res, next) => {
    try {
        const host = req.headers.host;
        if (!host) {
            return next();
        }

        // Handle localhost development
        // Example: store1.localhost:3000 or localhost:3000
        const parts = host.split('.');
        let subdomain = null;

        if (host.includes('localhost')) {
            // If it's something like store1.localhost:3000
            if (parts.length > 1) {
                subdomain = parts[0];
            }
        } else {
            // For production domains like store1.storely.com
            // We assume the base domain has 2 parts (storely.com)
            if (parts.length > 2) {
                subdomain = parts[0];
            }
        }

        // Reserved subdomains to ignore
        const reservedSubdomains = ['www', 'api', 'admin'];
        if (!subdomain || reservedSubdomains.includes(subdomain.toLowerCase())) {
            req.store = null;
            req.tenant = null;
            return next();
        }

        // Find store by slug (subdomain)
        try {
            const store = await StoreService.getStoreBySlug(subdomain.toLowerCase());
            req.store = store;
            req.tenant = store.id; // UUID or ID of the store
            next();
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({
                    success: false,
                    message: `Store '${subdomain}' not found`,
                    timestamp: new Date().toISOString()
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

module.exports = tenantMiddleware;
