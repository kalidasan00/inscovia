// backend/src/controllers/gallery.controller.js - WITH DEBUG LOGS
import prisma from "../lib/prisma.js";

// Upload gallery image
export const uploadGalleryImage = async (req, res) => {
  try {
    console.log("=== GALLERY UPLOAD START ===");
    console.log("1. Headers:", req.headers.authorization ? "Token present" : "No token");
    console.log("2. req.userId:", req.userId);
    console.log("3. req.userEmail:", req.userEmail);
    console.log("4. params.id:", req.params.id);
    console.log("5. req.file:", req.file ? "File present" : "No file");

    const { id } = req.params;

    // Your auth middleware sets req.userId
    if (!req.userId) {
      console.log("ERROR: No userId found");
      return res.status(401).json({ message: "Not authenticated" });
    }

    console.log("6. Finding center with id:", id);

    // Verify center belongs to this institute
    const center = await prisma.center.findUnique({
      where: { id }
    });

    console.log("7. Center found:", center ? "YES" : "NO");

    if (!center) {
      console.log("ERROR: Center not found");
      return res.status(404).json({ message: "Center not found" });
    }

    console.log("8. Center userId:", center.userId);
    console.log("9. Request userId:", req.userId);
    console.log("10. Match:", center.userId === req.userId);

    if (center.userId !== req.userId) {
      console.log("ERROR: Not authorized");
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check gallery limit
    const currentGallery = center.gallery || [];
    console.log("11. Current gallery count:", currentGallery.length);

    if (currentGallery.length >= 3) {
      console.log("ERROR: Gallery full");
      return res.status(400).json({ message: "Maximum 3 photos allowed" });
    }

    // Check if file was uploaded
    if (!req.file || !req.file.path) {
      console.log("ERROR: No file uploaded");
      console.log("req.file:", req.file);
      return res.status(400).json({ message: "No image file provided" });
    }

    console.log("12. File path:", req.file.path);

    // Add image URL to gallery
    const imageUrl = req.file.path;

    console.log("13. Updating center...");

    const updatedCenter = await prisma.center.update({
      where: { id },
      data: {
        gallery: {
          push: imageUrl
        }
      }
    });

    console.log("14. SUCCESS! Gallery updated");
    console.log("=== GALLERY UPLOAD END ===");

    res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      gallery: updatedCenter.gallery
    });

  } catch (error) {
    console.error("=== GALLERY UPLOAD ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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