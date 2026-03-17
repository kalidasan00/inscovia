// backend/src/routes/banner.routes.js
import express from "express";
import {
  getActiveBanners,
  getSlotAvailability,
  submitBanner,
  joinWaitlist,
  getInstituteBanners,
  getAllBannersAdmin,
  approveBanner,
  rejectBanner,
  deleteBanner
} from "../controllers/banner.controller.js";

const router = express.Router();

// Public
router.get("/active", getActiveBanners);
router.get("/slots", getSlotAvailability);

// Institute
router.post("/submit", submitBanner);
router.post("/waitlist", joinWaitlist);
router.get("/institute/:centerId", getInstituteBanners);

// Admin
router.get("/admin/all", getAllBannersAdmin);
router.patch("/admin/:id/approve", approveBanner);
router.patch("/admin/:id/reject", rejectBanner);
router.delete("/admin/:id", deleteBanner);

export default router;