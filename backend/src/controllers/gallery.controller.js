// backend/src/controllers/gallery.controller.js
import prisma from "../lib/prisma.js";

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

    // Check if file was uploaded
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Add image URL to gallery
    const imageUrl = req.file.path;

    const updatedCenter = await prisma.center.update({
      where: { id },
      data: {
        gallery: {
          push: imageUrl
        }
      }
    });

    res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      gallery: updatedCenter.gallery
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

    res.json({
      message: "Image deleted successfully",
      gallery: updatedCenter.gallery
    });

  } catch (error) {
    console.error("Gallery delete error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};