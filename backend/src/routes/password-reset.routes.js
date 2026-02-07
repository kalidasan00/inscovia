// backend/src/routes/password-reset.routes.js - FIXED VERSION
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { sendPasswordResetEmail } from "../utils/emailService.js"; // ✅ ADD THIS

const router = express.Router();
const prisma = new PrismaClient();

// In-memory storage for reset tokens (for production, use Redis or database)
const resetTokens = new Map();

// ✅ OPTIMIZED: Auto-cleanup expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
      console.log(`🧹 Cleaned expired reset token`);
    }
  }
}, 10 * 60 * 1000);

// ===== REQUEST PASSWORD RESET =====
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find institute user
    const user = await prisma.instituteUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return success (security: don't reveal if email exists)
    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 3600000; // 1 hour

      // Store token
      resetTokens.set(token, {
        email: user.email,
        expires
      });

      // ✅ FIXED: Actually send email using your emailService!
      try {
        await sendPasswordResetEmail(user.email, token, user.instituteName);
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send reset email:', emailError);
        // Still return success to user (security), but log the error
      }

      // Log for debugging (remove in production or make conditional)
      if (process.env.NODE_ENV !== 'production') {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/institute/reset-password?token=${token}`;
        console.log(`🔗 Reset link (dev): ${resetLink}`);
      }
    }

    // Always return success
    res.json({
      success: true,
      message: "If that email exists, we've sent reset instructions"
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== VERIFY RESET TOKEN =====
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid token" });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Token expired" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Verify token error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== RESET PASSWORD =====
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Verify token
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Token expired" });
    }

    // Find user
    const user = await prisma.instituteUser.findUnique({
      where: { email: tokenData.email }
    });

    if (!user) {
      resetTokens.delete(token);
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.instituteUser.update({
      where: { email: tokenData.email },
      data: { password: hashedPassword }
    });

    // Delete used token
    resetTokens.delete(token);

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