const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinaryConfig");
const crypto = require("crypto");

/**
 * Generates a Multer instance with Cloudinary Storage
 * @param {string} format - The format to save the file (jpg, png, webp, etc.)
 * @returns {multer} Multer instance configured with Cloudinary storage in 'horizon' folder
 */
const createMulter = (format = "png") => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const uniquePublicId = crypto.randomBytes(16).toString("hex");

      return {
        folder: "horizon", // All uploads go to the "horizon" folder
        format: format,
        public_id: uniquePublicId,
      };
    },
    done: (error, file) => {
      if (error) {
        console.log("Upload failed:", error);
      } else {
        console.log("File uploaded:", file);
        return {
          fileUrl: file.path,
          publicId: file.filename,
        };
      }
    },
  });

  return multer({ storage });
};

module.exports = createMulter;
