// backend/src/routes/centers.routes.js - FIXED
import express from "express";
import prisma from "../lib/prisma.js";
import {
  getCenters,
  getCenterBySlug,
  updateCenter,
  uploadLogo,
  uploadCoverImage
} from "../controllers/centers.controller.js";
import { uploadGalleryImage, deleteGalleryImage } from "../controllers/gallery.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload, { uploadGallery } from "../middleware/upload.js";

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

// Base Routes
router.get("/", getCenters);
router.get("/:slug", getCenterBySlug);
router.put("/:slug", authenticate, updateCenter);
router.post("/:slug/upload-logo", authenticate, upload.single("logo"), uploadLogo);
router.post("/:slug/upload-cover", authenticate, upload.single("image"), uploadCoverImage);

// ✅ FIXED: Gallery Routes - uploadGallery is ALREADY upload.single("image")
router.post("/:slug/upload-gallery", authenticate, uploadGallery, uploadGalleryImage);
router.delete("/:slug/delete-gallery", authenticate, deleteGalleryImage);

export default router;