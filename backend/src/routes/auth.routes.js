import express from "express";
import {
  registerInstitute,
  loginInstitute,
  getCurrentUser,
  sendOTP,
  verifyOTP
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// OTP routes (NEW)
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Existing routes
router.post("/register", registerInstitute);
router.post("/login", loginInstitute);
router.get("/me", authenticate, getCurrentUser);

export default router;