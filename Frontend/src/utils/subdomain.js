export const getSubdomain = () => {
    const hostname = window.location.hostname;

    // 1. Localhost development (e.g., store1.localhost)
    if (hostname.endsWith('.localhost')) {
        const parts = hostname.split('.');
        return parts.length > 1 ? parts[0] : null;
    }

    // 2. Production/Staging domains (e.g., store1.storely.com)
    const parts = hostname.split('.');
    if (parts.length >= 3) {
        const subdomain = parts[0];
        // Ignore common non-store subdomains
        if (['www', 'api', 'admin', 'app'].includes(subdomain)) return null;
        return subdomain;
    }

    return null;
};
