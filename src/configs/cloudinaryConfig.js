// utils/cloudinary.js
import cloudinary from 'cloudinary';
import { cloudinary_key, cloudinary_name, cloudinary_secret } from '../configs/envConfig.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: cloudinary_name,
  api_key: cloudinary_key,
  api_secret: cloudinary_secret,
});

// Utility function to extract public ID from URL
const extractPublicId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split('/').slice(2); // skip leading slash and version
    const pathWithoutVersion = parts.join('/');
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, ''); // remove extension
    return publicId;
  } catch (error) {
    throw new Error('Invalid image URL');
  }
};

/**
 * Delete a single image or multiple images from Cloudinary based on URL(s).
 * @param {string|string[]} imageUrls - A single image URL or an array of image URLs.
 * @returns {Promise<object[]>} - Results from Cloudinary API.
 */
export const deleteFromCloudinary = async (imageUrls) => {
  if (!imageUrls) {
    throw new Error('Image URL(s) are required');
  }

  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

  try {
    const deletePromises = urls.map(async (url) => {
      const publicId = extractPublicId(url);
      const result = await cloudinary.v2.uploader.destroy(publicId);
      return { url, result };
    });

    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Error deleting images:', error.message);
    throw error;
  }
};

// Default export cloudinary itself
export default cloudinary.v2;
