// backend/src/controllers/centers.controller.js - OPTIMIZED VERSION
import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js";

// ✅ OPTIMIZED: Safe JSON parser (prevents crashes)
const safeJSONParse = (data, fallback = []) => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return data;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ JSON parse error:', error.message);
    return fallback;
  }
};

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

// ✅ OPTIMIZED: Get centers with pagination
export const getCenters = async (req, res) => {
  try {
    // ✅ NEW: Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.center.count();

    // Get centers with pagination
    const centers = await prisma.center.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // ✅ OPTIMIZED: Safe parsing
    const centersWithParsedDetails = centers.map(center => ({
      ...center,
      courseDetails: safeJSONParse(center.courseDetails, [])
    }));

    res.json({
      centers: centersWithParsedDetails,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    console.error('❌ Get centers error:', error);
    res.status(500).json({ error: 'Failed to fetch centers' });
  }
};

// ✅ OPTIMIZED: Get center by slug
export const getCenterBySlug = async (req, res) => {
  try {
    const center = await prisma.center.findUnique({
      where: { slug: req.params.slug }
    });

    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    // ✅ OPTIMIZED: Safe parsing
    const centerWithParsedDetails = {
      ...center,
      courseDetails: safeJSONParse(center.courseDetails, [])
    };

    console.log(`✅ Center fetched: ${center.name} (${req.params.slug})`);

    res.json(centerWithParsedDetails);
  } catch (error) {
    console.error("❌ Error in getCenterBySlug:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ OPTIMIZED: Update center
export const updateCenter = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = { ...req.body };

    // ✅ OPTIMIZED: Verify ownership
    const center = await prisma.center.findUnique({
      where: { slug }
    });

    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    if (center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✨ Handle courseDetails if provided
    if (updateData.courses) {
      const courseDetails = parseCourseDetails(updateData.courses);
      updateData.courseDetails = courseDetails;
      updateData.courses = courseDetails.map(c => c.name);
    }

    // Update center
    const updatedCenter = await prisma.center.update({
      where: { id: center.id },
      data: updateData
    });

    // ✅ OPTIMIZED: Safe parsing
    const centerWithParsedDetails = {
      ...updatedCenter,
      courseDetails: safeJSONParse(updatedCenter.courseDetails, [])
    };

    console.log(`✅ Center updated: ${center.name}`);

    res.json({ success: true, center: centerWithParsedDetails });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ error: "Failed to update center" });
  }
};

// ✅ OPTIMIZED: Logo upload
export const uploadLogo = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const center = await prisma.center.findUnique({ where: { slug } });

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✨ Upload with optimization
    const config = getTransformations('logo');

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "logos",
          transformation: config.transformation
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

    console.log(`✅ Logo uploaded: ${result.secure_url} (${(result.bytes / 1024).toFixed(2)}KB)`);

    res.json({ success: true, logoUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

// ✅ OPTIMIZED: Cover image upload
export const uploadCoverImage = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const center = await prisma.center.findUnique({ where: { slug } });

    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✨ Upload with optimization
    const config = getTransformations('banner');

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "covers",
          transformation: config.transformation
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

    console.log(`✅ Banner uploaded: ${result.secure_url} (${(result.bytes / 1024).toFixed(2)}KB)`);

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload cover image" });
  }
};