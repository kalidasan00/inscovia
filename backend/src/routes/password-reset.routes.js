// backend/src/routes/password-reset.routes.js - OTP VERSION
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../utils/emailService.js";

const router = express.Router();
const prisma = new PrismaClient();

// Store OTPs: { email: { otp, expires } }
const resetOTPs = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Auto-cleanup expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of resetOTPs.entries()) {
    if (now > data.expires) {
      resetOTPs.delete(email);
      console.log(`🧹 Cleaned expired OTP for ${email}`);
    }
  }
}, 10 * 60 * 1000);

// ===== STEP 1: REQUEST PASSWORD RESET (SEND OTP) =====
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = await prisma.instituteUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return success (security)
    if (user) {
      // Generate OTP
      const otp = generateOTP();
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP
      resetOTPs.set(user.email, { otp, expires });

      // Send OTP email
      try {
        await sendPasswordResetEmail(user.email, otp, user.instituteName);
        console.log(`✅ Reset OTP sent to: ${user.email} (OTP: ${otp})`);
      } catch (emailError) {
        console.error('❌ Failed to send OTP:', emailError);
      }
    }

    res.json({
      success: true,
      message: "If that email exists, we've sent a verification code"
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== STEP 2: VERIFY OTP =====
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Get stored OTP
    const storedData = resetOTPs.get(email.toLowerCase().trim());

    if (!storedData) {
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }

    // Check expiry
    if (Date.now() > storedData.expires) {
      resetOTPs.delete(email);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid - mark as verified (keep in map for password reset)
    storedData.verified = true;
    resetOTPs.set(email, storedData);

    console.log(`✅ OTP verified for: ${email}`);

    res.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== STEP 3: RESET PASSWORD (AFTER OTP VERIFICATION) =====
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Email, OTP and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Verify OTP again
    const storedData = resetOTPs.get(email.toLowerCase().trim());

    if (!storedData) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    if (Date.now() > storedData.expires) {
      resetOTPs.delete(email);
      return res.status(400).json({ error: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (!storedData.verified) {
      return res.status(400).json({ error: "OTP not verified" });
    }

    // Find user
    const user = await prisma.instituteUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      resetOTPs.delete(email);
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.instituteUser.update({
      where: { email: user.email },
      data: { password: hashedPassword }
    });

    // Delete used OTP
    resetOTPs.delete(email);

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;