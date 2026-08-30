// backend/src/controllers/college.controller.js
import prisma from "../lib/prisma.js";

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

const COLLEGE_LIST_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  ownership: true,
  city: true,
  state: true,
  district: true,
  primaryCategory: true,
  secondaryCategories: true,
  rating: true,
  logo: true,
  image: true,
  nirfRank: true,
  naacGrade: true,
  description: true,
  latitude: true,
  longitude: true,
};

export const getColleges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};

    if (req.query.city) {
      where.city = {
        equals: String(req.query.city).trim().substring(0, 100),
        mode: "insensitive",
      };
    }

    if (req.query.category) {
      where.primaryCategory = String(req.query.category).trim().substring(0, 50);
    }

    if (req.query.type) {
      where.type = String(req.query.type).trim().substring(0, 50);
    }

    if (req.query.ownership) {
      where.ownership = String(req.query.ownership).trim().substring(0, 50);
    }

    const [totalCount, colleges] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        select: COLLEGE_LIST_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      colleges,
      pagination: { page, limit, totalPages: Math.ceil(totalCount / limit), totalCount }
    });
  } catch (error) {
    console.error('❌ Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

export const getCollegeBySlug = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { slug: String(req.params.slug).trim() }
    });
    if (!college) return res.status(404).json({ error: "College not found" });
    res.json({
      ...college,
      courses: safeJSONParse(college.courses, []),
      fees: safeJSONParse(college.fees, null),
      admissions: safeJSONParse(college.admissions, null),
      placements: safeJSONParse(college.placements, null),
      campus: safeJSONParse(college.campus, null),
      hostel: safeJSONParse(college.hostel, null),
    });
  } catch (error) {
    console.error("❌ Error in getCollegeBySlug:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = { ...req.body };

    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return res.status(404).json({ error: "College not found" });

    // Same dual auth pattern as Centers: allow via orgId OR userId (legacy accounts)
    const authorizedByOrg = college.orgId && college.orgId === req.orgId;
    const authorizedByUser = college.userId && college.userId === req.userId;
    if (!authorizedByOrg && !authorizedByUser) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedCollege = await prisma.college.update({
      where: { id: college.id },
      data: updateData
    });

    res.json({
      success: true,
      college: {
        ...updatedCollege,
        courses: safeJSONParse(updatedCollege.courses, []),
        fees: safeJSONParse(updatedCollege.fees, null),
        admissions: safeJSONParse(updatedCollege.admissions, null),
        placements: safeJSONParse(updatedCollege.placements, null),
        campus: safeJSONParse(updatedCollege.campus, null),
        hostel: safeJSONParse(updatedCollege.hostel, null),
      }
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ error: "Failed to update college" });
  }
};