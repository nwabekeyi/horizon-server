// multerConfig
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig';
import crypto from 'crypto';

/**
 * Generates a Multer instance with Cloudinary Storage to handle all file formats
 * @returns {multer} Multer instance configured with Cloudinary storage in 'horizon' folder
 */
export default function createMulter() {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const uniquePublicId = crypto.randomBytes(16).toString('hex');

      // Determine file format: if no valid format, fallback to 'png'
      const format = file.originalname ? file.originalname.split('.').pop() : 'png';

      return {
        folder: 'horizon', // All uploads go to the 'horizon' folder
        public_id: uniquePublicId,
        format, // Dynamic format based on file extension or fallback to 'png'
      };
    },
  });

  // File filter that accepts any file type, including blobs
  const fileFilter = (req, file, cb) => {
    // Check for common mime types and ensure it's not a 'blob'
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
      // Add any other MIME types you need here
    ];

    // If the file type is valid, accept it
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // If it's an invalid file type, reject it
      cb(new Error('Invalid file type'), false);
    }
  };

  // Create and return multer instance with Cloudinary storage and file filter
  return multer({ storage, fileFilter });
}