// backend/src/routes/banner.routes.js
import express from "express";
import {
  getActiveBanners,
  submitBanner,
  getInstituteBanners,
  getAllBannersAdmin,
  approveBanner,
  rejectBanner,
  deleteBanner
} from "../controllers/banner.controller.js";

const router = express.Router();

// Public
router.get("/active", getActiveBanners);

// Institute
router.post("/submit", submitBanner);
router.get("/institute/:centerId", getInstituteBanners);

// Admin
router.get("/admin/all", getAllBannersAdmin);
router.patch("/admin/:id/approve", approveBanner);
router.patch("/admin/:id/reject", rejectBanner);
router.delete("/admin/:id", deleteBanner);

export default router;