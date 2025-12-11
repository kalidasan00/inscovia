import express from "express";
import prisma from "../lib/prisma.js";
import {
  getCenters,
  getCenterById,
  updateCenter,
  uploadLogo,
  uploadCoverImage
} from "../controllers/centers.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Base Routes
router.get("/", getCenters);
router.get("/:id", getCenterById);
router.put("/:id", authenticate, updateCenter);
router.post("/:id/upload-logo", authenticate, upload.single("logo"), uploadLogo);
router.post("/:id/upload-cover", authenticate, upload.single("image"), uploadCoverImage);

// ⭐ Featured centers (NEW)
router.get("/featured/list", async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      where: { featured: true },
      take: 4,
      orderBy: { id: "desc" }
    });
    res.json(centers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load featured centers" });
  }
});

// 🔥 Top coaching centers (NEW)
router.get("/top/list", async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      where: { topRated: true },
      take: 4,
      orderBy: { id: "desc" }
    });
    res.json(centers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load top centers" });
  }
});

export default router;
