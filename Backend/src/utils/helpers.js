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

module.exports = {
    generateSlug,
    generateRandomString
};
