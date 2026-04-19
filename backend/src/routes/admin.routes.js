// backend/src/routes/admin.routes.js
import express from "express";
import {
  adminLogin,
  createAdmin,
  getAllAdmins,
  updateAdminPermissions,
  deleteAdmin,                // ✅ ADDED
  getDashboardStats,
  getAllInstitutes,
  approveInstitute,
  deleteInstitute,
  toggleInstituteStatus,
  getAllCenters,
  deleteCenter,
  getAllUsers,
  deleteUser,
  toggleUserStatus,
  getAnalytics,
  sendNotification,
  getAllNotifications,
  deleteNotification,
} from "../controllers/admin.controller.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/login", adminLogin);

// ─── Admin Management (SUPER_ADMIN only) ─────────────────────────────────────
router.get("/admins", adminOnly, getAllAdmins);
router.post("/admins", adminOnly, createAdmin);
router.put("/admins/:id/permissions", adminOnly, updateAdminPermissions);
router.delete("/admins/:id", adminOnly, deleteAdmin);  // ✅ ADDED

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", adminOnly, getDashboardStats);

// ─── Institutes ───────────────────────────────────────────────────────────────
router.get("/institutes", adminOnly, getAllInstitutes);
router.put("/institutes/:id/approve", adminOnly, approveInstitute);
router.put("/institutes/:id/toggle-status", adminOnly, toggleInstituteStatus);
router.delete("/institutes/:id", adminOnly, deleteInstitute);

// ─── Centers ──────────────────────────────────────────────────────────────────
router.get("/centers", adminOnly, getAllCenters);
router.delete("/centers/:id", adminOnly, deleteCenter);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get("/analytics", adminOnly, getAnalytics);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", adminOnly, getAllUsers);
router.delete("/users/:id", adminOnly, deleteUser);
router.put("/users/:id/toggle-status", adminOnly, toggleUserStatus);

// ─── Notifications ────────────────────────────────────────────────────────────
router.post("/notifications", adminOnly, sendNotification);
router.get("/notifications", adminOnly, getAllNotifications);
router.delete("/notifications/:id", adminOnly, deleteNotification);

export default router;