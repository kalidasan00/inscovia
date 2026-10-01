// backend/src/controllers/college.controller.js
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import cloudinary from "../config/cloudinary.js";
import { getTransformations } from "../utils/cloudinaryUpload.js";

const COLLEGE_CATEGORIES = [
  "ENGINEERING", "MEDICAL", "NURSING", "PHARMACY", "AYURVEDA_HOMEOPATHY",
  "ARTS_SCIENCE", "MANAGEMENT", "LAW", "ARCHITECTURE", "DEGREE", "PG", "POLYTECHNIC",
];
const COLLEGE_TYPES = ["UNIVERSITY", "COLLEGE", "INSTITUTE"];
const OWNERSHIP_TYPES = ["GOVERNMENT", "PRIVATE", "PUBLIC"];

// ─── helpers ───────────────────────────────────────────────────────────────

const isEmpty = (v) => v === "" || v === null;

// Int/Float columns: forms send strings, empty means "clear it"
const toNumberOrNull = (v) => {
  if (isEmpty(v)) return null;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

// Json? columns: Prisma rejects a plain JS null, it needs Prisma.DbNull
const toJson = (v) => (v === null ? Prisma.DbNull : v);

// Owner check shared by update and uploads
const isAuthorized = (college, req) => {
  const byOrg = college.orgId && college.orgId === req.orgId;
  const byUser = college.userId && college.userId === req.userId;
  return Boolean(byOrg || byUser);
};

// ─── LIST COLLEGES ─────────────────────────────────────────────────────────
// GET /api/colleges
// Optional query params: category, state, city, q (search), type, ownership
export const getColleges = async (req, res) => {
  try {
    const { category, state, city, q, type, ownership } = req.query;

    if (category && !COLLEGE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (type && !COLLEGE_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }
    if (ownership && !OWNERSHIP_TYPES.includes(ownership)) {
      return res.status(400).json({ error: "Invalid ownership" });
    }

    const where = {};
    if (category) {
      where.OR = [
        { primaryCategory: category },
        { secondaryCategories: { has: category } },
      ];
    }
    if (state) where.state = state;
    if (city) where.city = { equals: city, mode: "insensitive" };
    if (type) where.type = type;
    if (ownership) where.ownership = ownership;
    if (q) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const colleges = await prisma.college.findMany({
      where,
      select: {
        id: true, slug: true, name: true,
        type: true, ownership: true,
        primaryCategory: true, secondaryCategories: true,
        state: true, district: true, city: true, location: true,
        latitude: true, longitude: true,
        rating: true, description: true,
        image: true, logo: true,
        established: true, autonomous: true, deemedUniversity: true,
        naacGrade: true, nirfRank: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ colleges });
  } catch (error) {
    console.error("❌ Get colleges error:", error);
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
};

// ─── GET COLLEGE BY SLUG ───────────────────────────────────────────────────
// GET /api/colleges/:slug
export const getCollegeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
        reviews: {
          // userEmail is deliberately NOT selected: this endpoint is public
          select: { id: true, userName: true, rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    res.json(college);
  } catch (error) {
    console.error("❌ Get college by slug error:", error);
    res.status(500).json({ error: "Failed to fetch college" });
  }
};

// ─── UPDATE COLLEGE (dashboard Edit) ───────────────────────────────────────
// PUT /api/colleges/:slug — requires auth
export const updateCollege = async (req, res) => {
  try {
    const { slug } = req.params;
    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return res.status(404).json({ error: "College not found" });

    if (!isAuthorized(college, req)) {
      return res.status(403).json({ error: "Not authorized to edit this college" });
    }

    const {
      // identity (previously not editable)
      name, type, ownership, primaryCategory, secondaryCategories,
      state, district, city, location, latitude, longitude,
      // profile
      description, website, email, phone, whatsapp,
      facebook, instagram, linkedin, youtube,
      logo, image, gallery,
      established, affiliatedUniversity, autonomous, deemedUniversity, ugcRecognized,
      naacGrade, naacScore, naacYear,
      nirfRank, nirfCategory, nirfYear,
      aicteApproved, nbaAccredited, regulatoryBody,
      courses, fees, admissions, placements, campus, hostel, faculty,
      pinCode, mapsUrl,
    } = req.body;

    // ── validate enums ──
    if (type !== undefined && !COLLEGE_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid college type" });
    }
    if (ownership !== undefined && !OWNERSHIP_TYPES.includes(ownership)) {
      return res.status(400).json({ error: "Invalid ownership type" });
    }
    if (primaryCategory !== undefined && !COLLEGE_CATEGORIES.includes(primaryCategory)) {
      return res.status(400).json({ error: "Invalid primary category" });
    }
    if (secondaryCategories !== undefined) {
      if (!Array.isArray(secondaryCategories) ||
          secondaryCategories.some((c) => !COLLEGE_CATEGORIES.includes(c))) {
        return res.status(400).json({ error: "Invalid secondary category" });
      }
    }
    const finalPrimary = primaryCategory ?? college.primaryCategory;
    const finalSecondary = secondaryCategories ?? college.secondaryCategories;
    if (finalSecondary.includes(finalPrimary)) {
      return res.status(400).json({ error: "Primary category cannot be a secondary category" });
    }
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    // ── validate numbers ──
    const numericFields = { established, naacScore, naacYear, nirfRank, nirfYear, latitude, longitude };
    const numbers = {};
    for (const [key, value] of Object.entries(numericFields)) {
      if (value === undefined) continue;
      const parsed = toNumberOrNull(value);
      if (parsed === undefined) {
        return res.status(400).json({ error: `${key} must be a number` });
      }
      numbers[key] = parsed;
    }

    const updated = await prisma.college.update({
      where: { id: college.id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(type !== undefined && { type }),
        ...(ownership !== undefined && { ownership }),
        ...(primaryCategory !== undefined && { primaryCategory }),
        ...(secondaryCategories !== undefined && { secondaryCategories }),
        ...(state !== undefined && { state }),
        ...(district !== undefined && { district }),
        ...(city !== undefined && { city }),
        ...(location !== undefined && { location }),

        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(facebook !== undefined && { facebook }),
        ...(instagram !== undefined && { instagram }),
        ...(linkedin !== undefined && { linkedin }),
        ...(youtube !== undefined && { youtube }),
        ...(logo !== undefined && { logo }),
        ...(image !== undefined && { image }),
        ...(gallery !== undefined && { gallery }),

        ...("established" in numbers && { established: numbers.established }),
        ...("naacScore" in numbers && { naacScore: numbers.naacScore }),
        ...("naacYear" in numbers && { naacYear: numbers.naacYear }),
        ...("nirfRank" in numbers && { nirfRank: numbers.nirfRank }),
        ...("nirfYear" in numbers && { nirfYear: numbers.nirfYear }),
        ...("latitude" in numbers && { latitude: numbers.latitude }),
        ...("longitude" in numbers && { longitude: numbers.longitude }),

        ...(affiliatedUniversity !== undefined && { affiliatedUniversity }),
        ...(autonomous !== undefined && { autonomous }),
        ...(deemedUniversity !== undefined && { deemedUniversity }),
        ...(ugcRecognized !== undefined && { ugcRecognized }),
        ...(naacGrade !== undefined && { naacGrade }),
        ...(nirfCategory !== undefined && { nirfCategory }),
        ...(aicteApproved !== undefined && { aicteApproved }),
        ...(nbaAccredited !== undefined && { nbaAccredited }),
        ...(regulatoryBody !== undefined && { regulatoryBody }),

        // Json? columns
        ...(courses !== undefined && { courses: toJson(courses) }),
        ...(fees !== undefined && { fees: toJson(fees) }),
        ...(admissions !== undefined && { admissions: toJson(admissions) }),
        ...(placements !== undefined && { placements: toJson(placements) }),
        ...(campus !== undefined && { campus: toJson(campus) }),
        ...(hostel !== undefined && { hostel: toJson(hostel) }),
        ...(faculty !== undefined && { faculty: toJson(faculty) }),

        ...(pinCode !== undefined && { pinCode }),
        ...(mapsUrl !== undefined && { mapsUrl }),
      },
    });

    res.json({ success: true, college: updated });
  } catch (error) {
    console.error("❌ Update college error:", error);
    res.status(500).json({ error: "Failed to update college" });
  }
};

// ─── UPLOAD LOGO ───────────────────────────────────────────────────────────
// POST /api/colleges/:slug/upload-logo   (multipart field: "logo")
export const uploadCollegeLogo = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return res.status(404).json({ error: "College not found" });
    if (!isAuthorized(college, req)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const config = getTransformations("logo");
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "logos", transformation: config.transformation },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.college.update({ where: { id: college.id }, data: { logo: result.secure_url } });
    res.json({ success: true, logoUrl: result.secure_url });
  } catch (error) {
    console.error("❌ College logo upload error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

// ─── UPLOAD COVER IMAGE ────────────────────────────────────────────────────
// POST /api/colleges/:slug/upload-cover   (multipart field: "image")
export const uploadCollegeCover = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return res.status(404).json({ error: "College not found" });
    if (!isAuthorized(college, req)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const config = getTransformations("banner");
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "covers", transformation: config.transformation },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      uploadStream.end(req.file.buffer);
    });

    await prisma.college.update({ where: { id: college.id }, data: { image: result.secure_url } });
    res.json({ success: true, imageUrl: result.secure_url });
  } catch (error) {
    console.error("❌ College cover upload error:", error);
    res.status(500).json({ error: "Failed to upload cover image" });
  }
};