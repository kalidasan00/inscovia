// backend/src/routes/password-reset.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// In-memory storage for reset tokens (for production, use Redis or database)
const resetTokens = new Map();

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
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 3600000; // 1 hour

      // Store token
      resetTokens.set(token, {
        email: user.email,
        expires
      });

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/institute/reset-password?token=${token}`;

      // TODO: Send email (for now, just log)
      console.log("\n=================================");
      console.log("PASSWORD RESET REQUEST");
      console.log("=================================");
      console.log(`Email: ${user.email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`Token expires in 1 hour`);
      console.log("=================================\n");

      // In production, use nodemailer or email service:
      /*
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Inscovia",
        html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `
      });
      */
    }

    // Always return success
    res.json({
      success: true,
      message: "If that email exists, we've sent reset instructions"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
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
    console.error("Verify token error:", error);
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
      return res.status(400).json({ error: "Invalid token" });
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: "Token expired" });
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

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== CLEANUP EXPIRED TOKENS (run periodically) =====
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
    }
  }
}, 3600000); // Clean up every hour

export default router;