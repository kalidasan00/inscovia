// backend/src/controllers/gallery.controller.js - OPTIMIZED VERSION
import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js";

// ✅ OPTIMIZED: Helper to extract Cloudinary public ID
const getPublicIdFromUrl = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/xxx/image/upload/v123/gallery/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v123/' (version is optional)
    const afterUpload = parts.slice(uploadIndex + 1);
    const startIndex = afterUpload[0].startsWith('v') ? 1 : 0;
    const pathWithExtension = afterUpload.slice(startIndex).join('/');

    // Remove file extension
    return pathWithExtension.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('❌ Error parsing Cloudinary URL:', error);
    return null;
  }
};

// ✅ OPTIMIZED: Upload gallery image with atomic operations
export const uploadGalleryImage = async (req, res) => {
  let uploadedImageUrl = null;

  try {
    const { id } = req.params;

    // Check authentication
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check file exists
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "No image file provided",
        debug: {
          file: req.file ? "present" : "missing",
          buffer: req.file?.buffer ? "present" : "missing"
        }
      });
    }

    // ✅ OPTIMIZED: Single query to verify ownership AND get current gallery
    const center = await prisma.center.findFirst({
      where: {
        id,
        userId: req.userId // Verify ownership in query
      },
      select: {
        id: true,
        userId: true,
        name: true,
        gallery: true
      }
    });

    if (!center) {
      return res.status(404).json({ message: "Center not found or unauthorized" });
    }

    // ✅ OPTIMIZED: Check gallery limit
    const currentGallery = center.gallery || [];
    if (currentGallery.length >= 3) {
      return res.status(400).json({
        message: "Maximum 3 photos allowed",
        current: currentGallery.length
      });
    }

    // Upload to Cloudinary with optimization
    const config = getTransformations('gallery');

    const result = await new Promise((resolve, reject) => {
      // ✅ NEW: Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Upload timeout after 30 seconds'));
      }, 30000);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gallery",
          transformation: config.transformation,
          resource_type: 'auto'
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    uploadedImageUrl = result.secure_url;

    // ✅ OPTIMIZED: Atomic update with transaction
    const updatedCenter = await prisma.$transaction(async (tx) => {
      // Re-check gallery limit inside transaction (prevents race condition)
      const currentCenter = await tx.center.findUnique({
        where: { id: center.id },
        select: { gallery: true }
      });

      const gallery = currentCenter.gallery || [];
      if (gallery.length >= 3) {
        throw new Error('Gallery limit reached');
      }

      // Update with new image
      return await tx.center.update({
        where: { id: center.id },
        data: {
          gallery: {
            push: uploadedImageUrl
          }
        }
      });
    });

    const sizeKB = (result.bytes / 1024).toFixed(2);
    console.log(`✅ Gallery image uploaded for ${center.name}: ${sizeKB}KB (${updatedCenter.gallery.length}/3)`);

    return res.json({
      message: "Image uploaded successfully",
      imageUrl: uploadedImageUrl,
      gallery: updatedCenter.gallery,
      size: sizeKB + 'KB'
    });

  } catch (error) {
    console.error("❌ Gallery upload error:", error);

    // ✅ NEW: Cleanup - Delete from Cloudinary if database update failed
    if (uploadedImageUrl) {
      try {
        const publicId = getPublicIdFromUrl(uploadedImageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`🧹 Cleaned up orphaned image: ${publicId}`);
        }
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup orphaned image:', cleanupError);
      }
    }

    // Handle specific errors
    if (error.message === 'Gallery limit reached') {
      return res.status(400).json({
        message: "Maximum 3 photos allowed (concurrent upload detected)"
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(408).json({ message: "Upload timeout - please try again" });
    }

    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'production' ? 'Upload failed' : error.message
    });
  }
};

// ✅ OPTIMIZED: Delete gallery image
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // ✅ OPTIMIZED: Single query to verify ownership AND get gallery
    const center = await prisma.center.findFirst({
      where: {
        id,
        userId: req.userId
      },
      select: {
        id: true,
        name: true,
        gallery: true
      }
    });

    if (!center) {
      return res.status(404).json({ message: "Center not found or unauthorized" });
    }

    // Check if image exists in gallery
    const currentGallery = center.gallery || [];
    if (!currentGallery.includes(imageUrl)) {
      return res.status(404).json({ message: "Image not found in gallery" });
    }

    // Remove from gallery array
    const updatedGallery = currentGallery.filter(url => url !== imageUrl);

    // ✅ OPTIMIZED: Update database first, then try Cloudinary cleanup
    const updatedCenter = await prisma.center.update({
      where: { id: center.id },
      data: {
        gallery: updatedGallery
      }
    });

    // ✅ OPTIMIZED: Try to delete from Cloudinary (non-blocking)
    // Don't fail the request if this fails
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      cloudinary.uploader.destroy(publicId)
        .then(() => {
          console.log(`✅ Deleted from Cloudinary: ${publicId}`);
        })
        .catch((error) => {
          console.log('⚠️ Could not delete from Cloudinary:', error.message);
          // Image removed from database, Cloudinary cleanup failed - that's OK
        });
    }

    console.log(`✅ Gallery image deleted for ${center.name} (${updatedCenter.gallery.length}/3)`);

    res.json({
      message: "Image deleted successfully",
      gallery: updatedCenter.gallery
    });

  } catch (error) {
    console.error("❌ Gallery delete error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'production' ? 'Delete failed' : error.message
    });
  }
};