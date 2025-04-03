const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");
const crypto = require("crypto");

/**
 * Generates a Multer instance with Cloudinary Storage
 * @param {string} folder - The folder name in Cloudinary
 * @param {string} format - The format to save the file (jpg, png, webp, etc.)
 * @returns {multer} Multer instance configured with Cloudinary storage
 */
const createMulter = (folder = "uploads", format = "png") => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Generate a unique public ID using crypto (or any other custom logic)
      const uniquePublicId = crypto.randomBytes(16).toString("hex"); // Random 16-byte hex string
      
      return {
        folder: folder,
        format: format, // Set format dynamically
        public_id: uniquePublicId, // Use a unique public ID
      };
    },
    // This will trigger once the upload is complete
    done: (error, file) => {
      if (error) {
        console.log("Upload failed:", error);
      } else {
        // File uploaded successfully
        console.log("File uploaded:", file);
        return {
          fileUrl: file.path,  // Cloudinary URL
          publicId: file.filename, // Cloudinary public ID
        };
      }
    }
  });

  return multer({ storage });
};

module.exports = createMulter;
