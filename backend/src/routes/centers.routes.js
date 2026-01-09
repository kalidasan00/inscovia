import express from "express";
import prisma from "../lib/prisma.js";
import {
  getCenters,
  getCenterBySlug, // ← RENAMED from getCenterById
  updateCenter,
  uploadLogo,
  uploadCoverImage
} from "../controllers/centers.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ⭐ Featured centers (MUST BE BEFORE /:slug to avoid conflict)
router.get("/featured/list", async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      where: { featured: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    });
    res.json(centers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load featured centers" });
  }
});

// 🔥 Top coaching centers (MUST BE BEFORE /:slug to avoid conflict)
router.get("/top/list", async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      where: { topRated: true },
      take: 4,
      orderBy: { rating: "desc" }
    });
    res.json(centers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load top centers" });
  }
});

// Base Routes - Changed :id to :slug
router.get("/", getCenters);
router.get("/:slug", getCenterBySlug); // ← CHANGED from :id to :slug
router.put("/:slug", authenticate, updateCenter); // ← CHANGED from :id to :slug
router.post("/:slug/upload-logo", authenticate, upload.single("logo"), uploadLogo); // ← CHANGED
router.post("/:slug/upload-cover", authenticate, upload.single("image"), uploadCoverImage); // ← CHANGED

export default router;