/**
 * URL and Data Validator for Onboarding
 */

const SOCIAL_PATTERNS = {
    facebook_url: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
    instagram_url: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
    twitter_url: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+/i,
    linkedin_url: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    tiktok_url: /^https?:\/\/(www\.)?tiktok\.com\/.+/i,
};

/**
 * Validates a social media URL
 * @param {string} platform - the platform name (e.g. 'facebook_url')
 * @param {string} url - the URL to validate
 * @returns {object} { valid: boolean, url: string|null }
 */
const validateSocialUrl = (platform, url) => {
    if (!url) return { valid: true, url: null };

    // If it's just a handle, try to prepend the base URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) {
        const baseUrls = {
            facebook_url: 'https://facebook.com/',
            instagram_url: 'https://instagram.com/',
            twitter_url: 'https://twitter.com/',
            linkedin_url: 'https://linkedin.com/in/',
            tiktok_url: 'https://tiktok.com/@'
        };
        if (baseUrls[platform]) {
            formattedUrl = baseUrls[platform] + formattedUrl.replace(/^@/, '');
        }
    }

    if (!SOCIAL_PATTERNS[platform]) return { valid: true, url: formattedUrl };

    return {
        valid: SOCIAL_PATTERNS[platform].test(formattedUrl),
        url: formattedUrl
    };
};

module.exports = { validateSocialUrl };
