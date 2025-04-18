// config.js
require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  cloudinary_name: process.env.CLOUDINARY_NAME,
  cloudinary_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_secret: process.env.CLOUDINARY_API_SECRET,
  emailHost: process.env.SMTP_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT, 10),
    emailUser: process.env.SMTP_USER,
  emailPass: process.env.SMTP_PASS,
  emailFrom: process.env.SMTP_FROM,
  nodeEnv: process.env.NODE_ENV,
  prodUrl: process.env.PROD_URL,
  clientUrl: process.env.CLIENT_URL,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminCookie: process.env.COOKIE_SECRET,
  freeCurrencyApiKey: process.env.FREECURRENCYAPI_KEY

};