// backend/src/controllers/gallery.controller.js
import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js";

// Upload gallery image
export const uploadGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Your auth middleware sets req.userId
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify center belongs to this institute
    const center = await prisma.center.findUnique({
      where: { id }
    });

    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    if (center.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check gallery limit
    const currentGallery = center.gallery || [];
    if (currentGallery.length >= 3) {
      return res.status(400).json({ message: "Maximum 3 photos allowed" });
    }

    // ✨ NEW: Check if using multer memory storage (req.file.buffer)
    if (req.file && req.file.buffer) {
      // Upload with automatic optimization using memory buffer
      const config = getTransformations('gallery');

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "gallery",
            transformation: config.transformation // ← Auto-optimize
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const imageUrl = result.secure_url;

      const updatedCenter = await prisma.center.update({
        where: { id },
        data: {
          gallery: {
            push: imageUrl
          }
        }
      });

      console.log(`✅ Gallery image uploaded: ${imageUrl} (${(result.bytes / 1024).toFixed(2)}KB, ${updatedCenter.gallery.length}/3)`);

      return res.json({
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
        gallery: updatedCenter.gallery
      });
    }

    // ✨ FALLBACK: If using Cloudinary storage (req.file.path already exists)
    if (req.file && req.file.path) {
      const imageUrl = req.file.path;

      const updatedCenter = await prisma.center.update({
        where: { id },
        data: {
          gallery: {
            push: imageUrl
          }
        }
      });

      console.log(`✅ Gallery image uploaded: ${imageUrl} (${updatedCenter.gallery.length}/3)`);

      return res.json({
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
        gallery: updatedCenter.gallery
      });
    }

    // No file found
    return res.status(400).json({
      message: "No image file provided",
      debug: {
        file: req.file ? "present" : "missing",
        buffer: req.file?.buffer ? "present" : "missing",
        path: req.file?.path
      }
    });

  } catch (error) {
    console.error("Gallery upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete gallery image
export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    // Your auth middleware sets req.userId
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify center belongs to this institute
    const center = await prisma.center.findUnique({
      where: { id }
    });

    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    if (center.userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove from gallery array
    const updatedGallery = (center.gallery || []).filter(url => url !== imageUrl);

    // Update database
    const updatedCenter = await prisma.center.update({
      where: { id },
      data: {
        gallery: updatedGallery
      }
    });

    // ✨ NEW: Try to delete from Cloudinary (optional)
    try {
      // Extract public_id from URL
      const urlParts = imageUrl.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension

      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted from Cloudinary: ${publicId}`);
    } catch (cloudError) {
      console.log('⚠️ Could not delete from Cloudinary:', cloudError.message);
      // Don't fail the request if Cloudinary delete fails
    }

    console.log(`✅ Gallery image deleted (${updatedCenter.gallery.length}/3)`);

    res.json({
      message: "Image deleted successfully",
      gallery: updatedCenter.gallery
    });

  } catch (error) {
    console.error("Gallery delete error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};