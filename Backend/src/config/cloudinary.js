const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dcprciehx",
    api_key: process.env.CLOUDINARY_API_KEY || "676885613148875",
    api_secret: process.env.CLOUDINARY_API_SECRET || "IZvjgNP1wOH4hjcw7d4G_-sMNvI",
});

module.exports = cloudinary;
