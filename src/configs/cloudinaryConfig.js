const cloudinary = require("cloudinary").v2;
const {
    cloudinary_key,
    cloudinary_name,
    cloudinary_secret
} = require('../configs/envConfig')

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: cloudinary_name,
  api_key: cloudinary_key,
  api_secret: cloudinary_secret,
});

module.exports = cloudinary;
