// backend/src/routes/auth.routes.js
import express from "express";
import {
  registerInstitute,
  loginInstitute,
  getCurrentUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from "../controllers/auth.controller.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// OTP routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

// Auth routes
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);
router.get("/me", authenticate, getCurrentUser);

// Notification routes (institute)
router.get("/notifications", authenticate, getMyNotifications);
router.put("/notifications/read-all", authenticate, markAllNotificationsRead);
router.put("/notifications/:id/read", authenticate, markNotificationRead);

export default router;