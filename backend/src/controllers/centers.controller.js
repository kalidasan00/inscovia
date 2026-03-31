// backend/src/controllers/centers.controller.js - FIXED
import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js";

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

const parseCourseDetails = (coursesInput) => {
  if (!coursesInput) return [];
  if (Array.isArray(coursesInput) && coursesInput.length > 0 && typeof coursesInput[0] === 'object' && coursesInput[0].name) {
    return coursesInput.map(course => ({
      name: course.name || '',
      category: course.category || 'TECHNOLOGY',
      fees: course.fees ? parseInt(course.fees) : null,
      duration: course.duration || null
    }));
  }
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

// ✅ FIX #12: only select fields needed for listing cards — no sensitive/heavy fields
const CENTER_LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  city: true,
  state: true,
  district: true,
  primaryCategory: true,
  secondaryCategories: true,
  teachingMode: true,
  rating: true,
  logo: true,
  image: true,
  courses: true,
  courseDetails: true,
  description: true,
  latitude: true,
  longitude: true,
  // ❌ NOT included in list: phone, email, whatsapp, userId, gallery, facebook, instagram, linkedin, website
};

export const getCenters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ FIX #12: build where clause for city filter + sanitize input
    const where = {};

    if (req.query.city) {
      // ✅ case-insensitive city match using Prisma mode
      where.city = {
        equals: String(req.query.city).trim().substring(0, 100), // max 100 chars
        mode: "insensitive",
      };
    }

    if (req.query.category) {
      where.primaryCategory = String(req.query.category).trim().substring(0, 50);
    }

    const [totalCount, centers] = await Promise.all([
      prisma.center.count({ where }),
      prisma.center.findMany({
        where,
        // ✅ FIX #12: select only needed fields
        select: CENTER_LIST_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

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

export const getCenterBySlug = async (req, res) => {
  try {
    // ✅ slug detail page returns full data — that's fine
    const center = await prisma.center.findUnique({
      where: { slug: String(req.params.slug).trim() }
    });

    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    const centerWithParsedDetails = {
      ...center,
      courseDetails: safeJSONParse(center.courseDetails, [])
    };

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

    const center = await prisma.center.findUnique({ where: { slug } });

    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    if (center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (updateData.courses) {
      const courseDetails = parseCourseDetails(updateData.courses);
      updateData.courseDetails = courseDetails;
      updateData.courses = courseDetails.map(c => c.name);
    }

    const updatedCenter = await prisma.center.update({
      where: { id: center.id },
      data: updateData
    });

    const centerWithParsedDetails = {
      ...updatedCenter,
      courseDetails: safeJSONParse(updatedCenter.courseDetails, [])
    };

    res.json({ success: true, center: centerWithParsedDetails });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ error: "Failed to update center" });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const center = await prisma.center.findUnique({ where: { slug } });
    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const config = getTransformations('logo');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "logos", transformation: config.transformation },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id },
      data: { logo: result.secure_url }
    });

    res.json({ success: true, logoUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

export const uploadCoverImage = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const center = await prisma.center.findUnique({ where: { slug } });
    if (!center || center.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const config = getTransformations('banner');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "covers", transformation: config.transformation },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.center.update({
      where: { id: center.id },
      data: { image: result.secure_url }
    });

    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Failed to upload cover image" });
  }
};