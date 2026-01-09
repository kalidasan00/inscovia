import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const getCenters = async (req, res) => {
  const centers = await prisma.center.findMany();
  res.json({ centers });
};

// ← RENAMED and updated to use slug
export const getCenterBySlug = async (req, res) => {
  const center = await prisma.center.findUnique({
    where: { slug: req.params.slug } // ← Changed from id to slug
  });

  if (!center) return res.status(404).json({ error: "Not Found" });
  res.json(center);
};

// Update Center - Using slug
export const updateCenter = async (req, res) => {
  try {
    const { slug } = req.params; // ← Changed from id to slug
    const updateData = req.body;

    // Verify ownership - find by slug
    const center = await prisma.center.findUnique({ where: { slug } }); // ← Changed
    if (!center) return res.status(404).json({ error: "Center not found" });
    if (center.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    // Update center using id (slug might change if name/city updates)
    const updatedCenter = await prisma.center.update({
      where: { id: center.id }, // ← Use id for update, not slug
      data: updateData
    });

    res.json({ success: true, center: updatedCenter });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update center" });
  }
};

// Upload Logo - Using slug
export const uploadLogo = async (req, res) => {
  try {
    const { slug } = req.params; // ← Changed from id to slug
    const center = await prisma.center.findUnique({ where: { slug } }); // ← Changed

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "logos" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id }, // ← Use id for update
      data: { logo: result.secure_url }
    });

    res.json({ success: true, logoUrl: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

// Upload Cover - Using slug
export const uploadCoverImage = async (req, res) => {
  try {
    const { slug } = req.params; // ← Changed from id to slug
    const center = await prisma.center.findUnique({ where: { slug } }); // ← Changed

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "covers" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id }, // ← Use id for update
      data: { image: result.secure_url }
    });

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload cover image" });
  }
};