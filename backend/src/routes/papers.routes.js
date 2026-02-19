// backend/src/routes/papers.routes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import cloudinary from "../../config/cloudinary.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const generateSlug = (examName, year, shift) => {
  const base = `${examName}-${year}${shift ? '-' + shift : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString(36)}`;
};

// ============= PUBLIC ROUTES =============

router.get("/", async (req, res) => {
  try {
    const { examCategory, examName, year, language, search } = req.query;
    const where = { isActive: true };

    if (examCategory) where.examCategory = examCategory;
    if (examName) where.examName = { contains: examName, mode: "insensitive" };
    if (year) where.year = parseInt(year);
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { examName: { contains: search, mode: "insensitive" } },
        { examCategory: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const papers = await prisma.previousYearPaper.findMany({
      where,
      orderBy: [{ year: "desc" }, { examName: "asc" }],
    });

    const grouped = papers.reduce((acc, paper) => {
      if (!acc[paper.examCategory]) acc[paper.examCategory] = [];
      acc[paper.examCategory].push(paper);
      return acc;
    }, {});

    res.json({ success: true, papers, grouped, total: papers.length });
  } catch (error) {
    console.error("Get papers error:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// GET by slug (SEO)
router.get("/slug/:slug", async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { slug: req.params.slug },
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { id: req.params.id },
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    res.json({ success: true, paper });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// Increment download count
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

// ============= ADMIN ROUTES =============

// Upload new paper
router.post("/", adminOnly, upload.single("pdf"), async (req, res) => {
  try {
    const { examName, examCategory, subject, year, shift, language } = req.body;

    if (!examName || !examCategory || !year) {
      return res.status(400).json({ error: "examName, examCategory and year are required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const slug = generateSlug(examName, year, shift);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "inscovia/papers", resource_type: "raw", format: "pdf", public_id: slug },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    const paper = await prisma.previousYearPaper.create({
      data: {
        slug,
        examName,
        examCategory,
        subject: subject || null,
        year: parseInt(year),
        shift: shift || null,
        language: language || "English",
        pdfUrl: uploadResult.secure_url,
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(1)} MB`,
      },
    });

    res.status(201).json({ success: true, paper });
  } catch (error) {
    console.error("Upload paper error:", error);
    res.status(500).json({ error: "Failed to upload paper" });
  }
});

// ✅ Edit paper details (admin only)
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { examName, examCategory, subject, year, shift, language } = req.body;

    if (!examName || !examCategory || !year) {
      return res.status(400).json({ error: "examName, examCategory and year are required" });
    }

    const updated = await prisma.previousYearPaper.update({
      where: { id: req.params.id },
      data: {
        examName,
        examCategory,
        subject: subject || null,
        year: parseInt(year),
        shift: shift || null,
        language: language || "English",
      },
    });

    res.json({ success: true, paper: updated });
  } catch (error) {
    console.error("Edit paper error:", error);
    res.status(500).json({ error: "Failed to update paper" });
  }
});

// Delete paper
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { id: req.params.id },
    });
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

// Toggle active status
router.put("/:id/toggle", adminOnly, async (req, res) => {
  try {
    const paper = await prisma.previousYearPaper.findUnique({
      where: { id: req.params.id },
    });
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const updated = await prisma.previousYearPaper.update({
      where: { id: req.params.id },
      data: { isActive: !paper.isActive },
    });

    res.json({ success: true, paper: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle paper status" });
  }
});

export default router;