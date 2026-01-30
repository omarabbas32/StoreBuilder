import { ASSET_BASE_URL } from '../services/api';

/**
 * Formats an image URL to ensure it has the correct base URL prefix
 * @param {string} url - The image URL or relative path
 * @returns {string} - The formatted URL
 */
export const formatImageUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL (http, https, data:), return as is
    if (/^(http|https|data:)/i.test(url)) {
        return url;
    }

    // Ensure the path starts with a slash
    const path = url.startsWith('/') ? url : `/${url}`;

    // Prefix with the asset base URL
    return `${ASSET_BASE_URL}${path}`;
};
