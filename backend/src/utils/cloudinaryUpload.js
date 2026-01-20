// backend/src/utils/cloudinaryUpload.js
// Minimal version - No extra dependencies needed!

/**
 * Get transformation config for different image types
 * @param {string} imageType - 'logo', 'banner', or 'gallery'
 * @returns {Object} - Cloudinary transformation config
 */
export const getTransformations = (imageType) => {
  const configs = {
    logo: {
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    },

    banner: {
      transformation: [
        { width: 1200, height: 628, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    },

    gallery: {
      transformation: [
        { width: 1080, height: 1080, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    }
  };

  return configs[imageType] || configs.gallery;
};