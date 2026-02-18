import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendOTPEmail } from "../utils/emailService.js";

const router = express.Router();

// Store OTPs temporarily
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============= NEW OTP ROUTES =============

// Send OTP for User Registration
router.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt, name });

    await sendOTPEmail(email, otp, name);

    console.log(`✅ User OTP sent to ${email}: ${otp}`);

    res.json({ success: true, message: "OTP sent successfully to your email", expiresIn: 600 });

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

// Verify OTP for User
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    otpStore.delete(email);

    console.log(`✅ User OTP verified for ${email}`);

    res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ============= FORGOT PASSWORD ROUTES =============

// Step 1: Send reset OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`reset_${email}`, { otp, expiresAt });

    await sendOTPEmail(email, otp, user.name);

    console.log(`✅ User reset OTP sent to ${email}: ${otp}`);

    res.json({ success: true, message: "Verification code sent to your email" });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// Step 2: Verify reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const storedData = otpStore.get(`reset_${email}`);

    if (!storedData) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    console.log(`✅ User reset OTP verified for ${email}`);

    res.json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("❌ Verify reset OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Step 3: Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Email, OTP and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const storedData = otpStore.get(`reset_${email}`);

    if (!storedData) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashedPassword }
    });

    otpStore.delete(`reset_${email}`);

    console.log(`✅ User password reset for ${email}`);

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ============= EXISTING ROUTES =============

// Student Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;

    if (!name || !email || !phone || !gender || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ error: "Invalid gender selection" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, phone, gender, password: hashedPassword }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, gender: user.gender }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Student Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, gender: user.gender }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;