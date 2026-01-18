// backend/src/routes/auth.js
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
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// OTP routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Password reset routes (NEW)
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

// Auth routes
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);
router.get("/me", authenticate, getCurrentUser);

export default router;