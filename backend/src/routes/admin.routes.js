// backend/src/routes/admin.routes.js
import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getAllInstitutes,
  approveInstitute,
  deleteInstitute,
  toggleInstituteStatus,
  getAllCenters,
  deleteCenter
} from "../controllers/admin.controller.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public route - Admin login
router.post("/login", adminLogin);

// Protected admin routes
router.get("/dashboard/stats", adminOnly, getDashboardStats);
router.get("/institutes", adminOnly, getAllInstitutes);
router.put("/institutes/:id/approve", adminOnly, approveInstitute);
router.put("/institutes/:id/toggle-status", adminOnly, toggleInstituteStatus);
router.delete("/institutes/:id", adminOnly, deleteInstitute);
router.get("/centers", adminOnly, getAllCenters);
router.delete("/centers/:id", adminOnly, deleteCenter);

export default router;