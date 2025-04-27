// config
import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 3000;
export const dbUrl = process.env.DB_URL;
export const jwtSecret = process.env.JWT_SECRET;
export const cloudinary_name = process.env.CLOUDINARY_NAME;
export const cloudinary_key = process.env.CLOUDINARY_API_KEY;
export const cloudinary_secret = process.env.CLOUDINARY_API_SECRET;
export const emailHost = process.env.SMTP_HOST;
export const emailPort = parseInt(process.env.EMAIL_PORT, 10);
export const emailUser = process.env.SMTP_USER;
export const emailPass = process.env.SMTP_PASS;
export const emailFrom = process.env.SMTP_FROM;
export const nodeEnv = process.env.NODE_ENV;
export const prodUrl = process.env.PROD_URL;
export const clientUrl = process.env.CLIENT_URL;
export const adminEmail = process.env.ADMIN_EMAIL;
export const adminPassword = process.env.ADMIN_PASSWORD;
export const adminCookie = process.env.COOKIE_SECRET;
export const twoFaUpdateSecret = process.env.TWO_FA_UPDATE_SECRET;
export const freeCurrencyApiKey = process.env.FREECURRENCYAPI_KEY;