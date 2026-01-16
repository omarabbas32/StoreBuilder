const crypto = require('crypto');

const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

const generateRandomString = (length = 16) => {
    return crypto.randomBytes(length).toString('hex');
};

const deepMerge = (target, source) => {
    if (!source || typeof source !== 'object') return target;
    if (!target || typeof target !== 'object') return source;

    const output = { ...target };

    Object.keys(source).forEach(key => {
        if (Array.isArray(source[key])) {
            output[key] = source[key];
        } else if (source[key] && typeof source[key] === 'object') {
            if (!(key in target)) {
                output[key] = source[key];
            } else {
                output[key] = deepMerge(target[key], source[key]);
            }
        } else {
            output[key] = source[key];
        }
    });

    return output;
};

module.exports = {
    generateSlug,
    generateRandomString,
    deepMerge
};
