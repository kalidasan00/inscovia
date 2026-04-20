// backend/src/routes/categories.routes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/categories — all active categories (used by public papers page + dropdowns)
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.examCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true,
        description: true, color: true, sortOrder: true,
        _count: { select: { papers: { where: { isActive: true } } } },
      },
    });

    res.json({
      success: true,
      categories: categories.map(c => ({
        ...c,
        paperCount: c._count.papers,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("❌ getCategories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/categories/:slug — single category (SEO page)
router.get("/:slug", async (req, res) => {
  try {
    const category = await prisma.examCategory.findUnique({
      where: { slug: req.params.slug },
      include: {
        papers: {
          where: { isActive: true },
          orderBy: [{ year: "desc" }, { examName: "asc" }],
        },
      },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// GET /api/categories/admin/all — all categories including inactive (admin only)
router.get("/admin/all", adminOnly, async (req, res) => {
  try {
    const categories = await prisma.examCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { papers: true } },
      },
    });
    res.json({
      success: true,
      categories: categories.map(c => ({
        ...c,
        paperCount: c._count.papers,
        _count: undefined,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/categories — create new category
router.post("/", adminOnly, async (req, res) => {
  try {
    const { name, description, color, sortOrder } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // ✅ Auto-generate slug from name
    const slug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // ✅ Check duplicate
    const existing = await prisma.examCategory.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Category already exists" });
    }

    const category = await prisma.examCategory.create({
      data: {
        name:        name.trim(),
        slug,
        description: description || null,
        color:       color       || "#6b7280",
        sortOrder:   sortOrder   || 0,
        isActive:    true,
      },
    });

    console.log(`✅ Category created: ${category.name}`);
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("❌ createCategory error:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:id — update category
router.put("/:id", adminOnly, async (req, res) => {
  try {
    const { name, description, color, sortOrder, isActive } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // ✅ Check duplicate name (excluding self)
    const existing = await prisma.examCategory.findFirst({
      where: { name: name.trim(), NOT: { id: req.params.id } },
    });
    if (existing) {
      return res.status(409).json({ error: "Another category with this name already exists" });
    }

    const updated = await prisma.examCategory.update({
      where: { id: req.params.id },
      data: {
        name:        name.trim(),
        description: description || null,
        color:       color       || "#6b7280",
        sortOrder:   sortOrder   !== undefined ? parseInt(sortOrder) : undefined,
        isActive:    isActive    !== undefined ? isActive : undefined,
      },
    });

    res.json({ success: true, category: updated });
  } catch (error) {
    console.error("❌ updateCategory error:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/categories/:id — delete category
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    // ✅ Block delete if papers exist under this category
    const paperCount = await prisma.previousYearPaper.count({
      where: { examCategoryId: req.params.id },
    });
    if (paperCount > 0) {
      return res.status(400).json({
        error: `Cannot delete — ${paperCount} paper(s) are linked to this category. Delete or move them first.`,
      });
    }

    await prisma.examCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("❌ deleteCategory error:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// PUT /api/categories/:id/toggle — toggle active status
router.put("/:id/toggle", adminOnly, async (req, res) => {
  try {
    const cat = await prisma.examCategory.findUnique({ where: { id: req.params.id } });
    if (!cat) return res.status(404).json({ error: "Category not found" });

    const updated = await prisma.examCategory.update({
      where: { id: req.params.id },
      data: { isActive: !cat.isActive },
    });
    res.json({ success: true, category: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle category" });
  }
});

export default router;