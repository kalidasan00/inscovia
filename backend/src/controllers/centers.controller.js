import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js"; // ← ADD THIS LINE

// ✨ Helper function to parse and validate courseDetails
const parseCourseDetails = (coursesInput) => {
  if (!coursesInput) return [];

  // If it's already an array of objects with details
  if (Array.isArray(coursesInput) && coursesInput.length > 0 && typeof coursesInput[0] === 'object' && coursesInput[0].name) {
    return coursesInput.map(course => ({
      name: course.name || '',
      category: course.category || 'TECHNOLOGY',
      fees: course.fees ? parseInt(course.fees) : null,
      duration: course.duration || null
    }));
  }

  // If it's an array of strings (old format)
  if (Array.isArray(coursesInput) && coursesInput.length > 0 && typeof coursesInput[0] === 'string') {
    return coursesInput.map(courseName => ({
      name: courseName,
      category: 'TECHNOLOGY',
      fees: null,
      duration: null
    }));
  }

  return [];
};

export const getCenters = async (req, res) => {
  const centers = await prisma.center.findMany();

  // Parse courseDetails for all centers
  const centersWithParsedDetails = centers.map(center => ({
    ...center,
    courseDetails: typeof center.courseDetails === 'string'
      ? JSON.parse(center.courseDetails)
      : center.courseDetails
  }));

  res.json({ centers: centersWithParsedDetails });
};

export const getCenterBySlug = async (req, res) => {
  try {
    const center = await prisma.center.findUnique({
      where: { slug: req.params.slug }
    });

    if (!center) return res.status(404).json({ error: "Not Found" });

    // 🔍 DEBUG - Check what we have from database
    console.log("\n=== BACKEND DEBUG ===");
    console.log("Slug:", req.params.slug);
    console.log("Center found:", center.name);
    console.log("Raw courseDetails type:", typeof center.courseDetails);
    console.log("Raw courseDetails is array?:", Array.isArray(center.courseDetails));
    console.log("Raw courseDetails value:", center.courseDetails);

    // ✨ FIX: Parse courseDetails JSON before sending to frontend
    const centerWithParsedDetails = {
      ...center,
      courseDetails: typeof center.courseDetails === 'string'
        ? JSON.parse(center.courseDetails)
        : (center.courseDetails || [])
    };

    console.log("\n✅ After parsing:");
    console.log("courseDetails type:", typeof centerWithParsedDetails.courseDetails);
    console.log("courseDetails is array?:", Array.isArray(centerWithParsedDetails.courseDetails));
    console.log("courseDetails length:", centerWithParsedDetails.courseDetails?.length);
    if (centerWithParsedDetails.courseDetails?.[0]) {
      console.log("First course:", JSON.stringify(centerWithParsedDetails.courseDetails[0], null, 2));
    }
    console.log("===================\n");

    res.json(centerWithParsedDetails);
  } catch (error) {
    console.error("❌ Error in getCenterBySlug:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateCenter = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = { ...req.body };

    // Verify ownership
    const center = await prisma.center.findUnique({ where: { slug } });
    if (!center) return res.status(404).json({ error: "Center not found" });
    if (center.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    // ✨ Handle courseDetails if provided
    if (updateData.courses) {
      const courseDetails = parseCourseDetails(updateData.courses);
      updateData.courseDetails = courseDetails;

      // Also update the simple courses array for backward compatibility
      updateData.courses = courseDetails.map(c => c.name);
    }

    // Update center
    const updatedCenter = await prisma.center.update({
      where: { id: center.id },
      data: updateData
    });

    // Parse courseDetails before returning
    const centerWithParsedDetails = {
      ...updatedCenter,
      courseDetails: typeof updatedCenter.courseDetails === 'string'
        ? JSON.parse(updatedCenter.courseDetails)
        : updatedCenter.courseDetails
    };

    res.json({ success: true, center: centerWithParsedDetails });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update center" });
  }
};

// ✅ UPDATED: Logo upload with automatic optimization
export const uploadLogo = async (req, res) => {
  try {
    const { slug } = req.params;
    const center = await prisma.center.findUnique({ where: { slug } });

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✨ Add automatic optimization
    const config = getTransformations('logo');

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "logos",
          transformation: config.transformation // ← ADD THIS LINE
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id },
      data: { logo: result.secure_url }
    });

    console.log(`✅ Logo uploaded: ${result.secure_url} (${(result.bytes / 1024).toFixed(2)}KB)`); // ← ADD THIS LINE

    res.json({ success: true, logoUrl: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

// ✅ UPDATED: Cover image upload with automatic optimization
export const uploadCoverImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const center = await prisma.center.findUnique({ where: { slug } });

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✨ Add automatic optimization
    const config = getTransformations('banner');

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "covers",
          transformation: config.transformation // ← ADD THIS LINE
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id },
      data: { image: result.secure_url }
    });

    console.log(`✅ Banner uploaded: ${result.secure_url} (${(result.bytes / 1024).toFixed(2)}KB)`); // ← ADD THIS LINE

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload cover image" });
  }
};