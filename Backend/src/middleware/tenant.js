const container = require('../container');
const { NotFoundError } = require('../utils/errors');

/**
 * Middleware to extract subdomain and identify the tenant (Store)
 */
const tenantMiddleware = async (req, res, next) => {
    console.log(`[DEBUG_TENANT] Request for host: ${req.headers.host}`);
    try {
        const host = req.headers.host;
        if (!host) {
            return next();
        }

        // reserved info
        const reservedSubdomains = ['www', 'api', 'admin', 'localhost', '127', '0', '::1'];

        // Handle IP addresses (don't treat them as subdomains)
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host.split(':')[0]) || host.includes('[::1]');
        if (isIP) {
            req.store = null;
            req.tenant = null;
            return next();
        }

        const parts = host.split('.');
        let subdomain = null;

        if (host.includes('localhost')) {
            if (parts.length > 1) {
                subdomain = parts[0];
            }
        } else {
            if (parts.length > 2) {
                subdomain = parts[0];
            }
        }

        if (!subdomain || reservedSubdomains.includes(subdomain.toLowerCase())) {
            req.store = null;
            req.tenant = null;
            return next();
        }

        // Find store by slug (subdomain) using the container's service
        try {
            const store = await container.storeService.getStoreBySlug(subdomain.toLowerCase());
            req.store = store;
            req.tenant = store.id;
            next();
        } catch (error) {
            if (error.statusCode === 404) {
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
