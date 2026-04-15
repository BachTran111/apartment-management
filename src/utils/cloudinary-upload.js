import cloudinary from "../config/cloudinary.config.js";

/**
 * Upload file lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {String} fileName - Tên file
 * @param {String} folder - Thư mục trên Cloudinary (vd: "tenants/avatars")
 * @returns {Promise<String>} URL của file đã upload
 */
export const uploadToCloudinary = async (fileBuffer, fileName, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        public_id: fileName,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Xóa file từ Cloudinary
 * @param {String} publicId - Public ID của file trên Cloudinary
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
};
