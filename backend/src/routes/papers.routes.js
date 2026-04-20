// backend/src/routes/papers.routes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const generateSlug = (examName, year, shift) => {
  const base = `${examName}-${year}${shift ? "-" + shift : ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${Date.now().toString(36)}`;
};

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/papers — all active papers with category info
router.get("/", async (req, res) => {
  try {
    const { examCategoryId, examName, year, language, search } = req.query;

    const where = { isActive: true };
    if (examCategoryId) where.examCategoryId = examCategoryId;
    if (examName)       where.examName = { contains: examName, mode: "insensitive" };
    if (year)           where.year     = parseInt(year);
    if (language)       where.language = language;
    if (search) {
      where.OR = [
        { examName:            { contains: search, mode: "insensitive" } },
        { subject:             { contains: search, mode: "insensitive" } },
        { examCategory: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const papers = await prisma.previousYearPaper.findMany({
      where,
      orderBy: [{ year: "desc" }, { examName: "asc" }],
      include: {
        examCategory: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    // ✅ Group by category name for frontend consumption
    const grouped = papers.reduce((acc, paper) => {
      const catName = paper.examCategory.name;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(paper);
      return acc;
    }, {});

    res.json({ success: true, papers, grouped, total: papers.length });
  } catch (error) {
    console.error("Get papers error:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// GET /api/papers/slug/:slug — single paper by slug (SEO)
router.get("/slug/:slug", async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { slug: req.params.slug },
      include: { examCategory: true },
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// GET /api/papers/:id — single paper by id
router.get("/:id", async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { id: req.params.id },
      include: { examCategory: true },
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// POST /api/papers/:id/download — increment download count
router.post("/:id/download", async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.update({
      where: { id: req.params.id },
      data: { downloads: { increment: 1 } },
    });
    res.json({ success: true, pdfUrl: paper.pdfUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to process download" });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// POST /api/papers — upload new paper
router.post("/", adminOnly, upload.single("pdf"), async (req, res) => {
  try {
    const { examName, examCategoryId, subject, year, shift, language, metaTitle, metaDescription } = req.body;

    if (!examName || !examCategoryId || !year) {
      return res.status(400).json({ error: "examName, examCategoryId and year are required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    // ✅ Verify category exists
    const category = await prisma.examCategory.findUnique({ where: { id: examCategoryId } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const slug = generateSlug(examName, year, shift);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "inscovia/papers", resource_type: "raw", format: "pdf", public_id: slug },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    // ✅ Auto-generate SEO meta if not provided
    const autoMetaTitle = metaTitle ||
      `${examName} ${year}${shift ? ` ${shift}` : ""}${subject ? ` ${subject}` : ""} Question Paper PDF`;
    const autoMetaDescription = metaDescription ||
      `Download ${examName} ${year} previous year question paper PDF for free. ${subject ? subject + " paper. " : ""}Available in ${language || "English"}.`;

    const paper = await prisma.previousYearPaper.create({
      data: {
        slug,
        examName,
        examCategoryId,
        subject:         subject         || null,
        year:            parseInt(year),
        shift:           shift           || null,
        language:        language        || "English",
        pdfUrl:          uploadResult.secure_url,
        fileSize:        `${(req.file.size / 1024 / 1024).toFixed(1)} MB`,
        metaTitle:       autoMetaTitle,
        metaDescription: autoMetaDescription,
      },
      include: { examCategory: true },
    });

    res.status(201).json({ success: true, paper });
  } catch (error) {
    console.error("Upload paper error:", error);
    res.status(500).json({ error: "Failed to upload paper" });
  }
});

// PUT /api/papers/:id — edit paper details
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { examName, examCategoryId, subject, year, shift, language, metaTitle, metaDescription } = req.body;

    if (!examName || !examCategoryId || !year) {
      return res.status(400).json({ error: "examName, examCategoryId and year are required" });
    }

    // ✅ Verify category exists
    const category = await prisma.examCategory.findUnique({ where: { id: examCategoryId } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const updated = await prisma.previousYearPaper.update({
      where: { id: req.params.id },
      data: {
        examName,
        examCategoryId,
        subject:         subject         || null,
        year:            parseInt(year),
        shift:           shift           || null,
        language:        language        || "English",
        metaTitle:       metaTitle       || null,
        metaDescription: metaDescription || null,
      },
      include: { examCategory: true },
    });

    res.json({ success: true, paper: updated });
  } catch (error) {
    console.error("Edit paper error:", error);
    res.status(500).json({ error: "Failed to update paper" });
  }
});

// DELETE /api/papers/:id — delete paper + Cloudinary file
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({ where: { id: req.params.id } });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    if (paper.pdfUrl) {
      await cloudinary.uploader.destroy(`inscovia/papers/${paper.slug}`, { resource_type: "raw" });
    }

    await prisma.previousYearPaper.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Paper deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete paper" });
  }
});

// PUT /api/papers/:id/toggle — toggle active status
router.put("/:id/toggle", adminOnly, async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({ where: { id: req.params.id } });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const updated = await prisma.previousYearPaper.update({
      where: { id: req.params.id },
      data:  { isActive: !paper.isActive },
    });
    res.json({ success: true, paper: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle paper status" });
  }
});

export default router;