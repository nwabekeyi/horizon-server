// config.js
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  cloudinary_name: process.env.CLOUDINARY_NAME,
  cloudinary_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret: process.env.CLOUDINARY_API_SECRET,
  emailHost: process.env.EMAIL_HOST,
  emailPort : process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS
};
