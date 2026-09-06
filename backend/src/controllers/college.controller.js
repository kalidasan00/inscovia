// backend/src/controllers/college.controller.js
import prisma from "../lib/prisma.js";

// ─── LIST COLLEGES ─────────────────────────────────────────────────────────
// GET /api/colleges
// Optional query params: category, state, city, q (search), type, ownership
export const getColleges = async (req, res) => {
  try {
    const { category, state, city, q, type, ownership } = req.query;

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
// PUT /api/colleges/:slug — requires auth; only the owning org's member can edit
export const updateCollege = async (req, res) => {
  try {
    const { slug } = req.params;
    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) return res.status(404).json({ error: "College not found" });

    // req.orgId is expected to be set by the auth middleware (same pattern as Center routes)
    if (!req.orgId || college.orgId !== req.orgId) {
      return res.status(403).json({ error: "Not authorized to edit this college" });
    }

    const {
      description, website, email, phone, whatsapp,
      facebook, instagram, linkedin, youtube,
      logo, image, gallery,
      established, affiliatedUniversity, autonomous, deemedUniversity, ugcRecognized,
      naacGrade, naacScore, naacYear,
      nirfRank, nirfCategory, nirfYear,
      aicteApproved, nbaAccredited, regulatoryBody,
      courses, fees, admissions, placements, campus, hostel,
      pinCode, mapsUrl,
    } = req.body;

    const updated = await prisma.college.update({
      where: { slug },
      data: {
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
        ...(established !== undefined && { established }),
        ...(affiliatedUniversity !== undefined && { affiliatedUniversity }),
        ...(autonomous !== undefined && { autonomous }),
        ...(deemedUniversity !== undefined && { deemedUniversity }),
        ...(ugcRecognized !== undefined && { ugcRecognized }),
        ...(naacGrade !== undefined && { naacGrade }),
        ...(naacScore !== undefined && { naacScore }),
        ...(naacYear !== undefined && { naacYear }),
        ...(nirfRank !== undefined && { nirfRank }),
        ...(nirfCategory !== undefined && { nirfCategory }),
        ...(nirfYear !== undefined && { nirfYear }),
        ...(aicteApproved !== undefined && { aicteApproved }),
        ...(nbaAccredited !== undefined && { nbaAccredited }),
        ...(regulatoryBody !== undefined && { regulatoryBody }),
        ...(courses !== undefined && { courses }),
        ...(fees !== undefined && { fees }),
        ...(admissions !== undefined && { admissions }),
        ...(placements !== undefined && { placements }),
        ...(campus !== undefined && { campus }),
        ...(hostel !== undefined && { hostel }),
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