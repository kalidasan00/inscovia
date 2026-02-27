import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendOTPEmail } from "../utils/emailService.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Store OTPs temporarily
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============= OTP ROUTES =============

router.post("/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Email and name are required" });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt, name });
    await sendOTPEmail(email, otp, name);
    res.json({ success: true, message: "OTP sent successfully to your email", expiresIn: 600 });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
    const storedData = otpStore.get(email);
    if (!storedData) return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    if (Date.now() > storedData.expiresAt) { otpStore.delete(email); return res.status(400).json({ error: "OTP expired. Please request a new one." }); }
    if (storedData.otp !== otp) return res.status(400).json({ error: "Invalid OTP. Please try again." });
    otpStore.delete(email);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ============= FORGOT PASSWORD ROUTES =============

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(`reset_${email}`, { otp, expiresAt });
    await sendOTPEmail(email, otp, user.name);
    res.json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
    const storedData = otpStore.get(`reset_${email}`);
    if (!storedData) return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    if (Date.now() > storedData.expiresAt) { otpStore.delete(`reset_${email}`); return res.status(400).json({ error: "OTP expired. Please request a new one." }); }
    if (storedData.otp !== otp) return res.status(400).json({ error: "Invalid OTP. Please try again." });
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Verify reset OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ error: "Email, OTP and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const storedData = otpStore.get(`reset_${email}`);
    if (!storedData) return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    if (Date.now() > storedData.expiresAt) { otpStore.delete(`reset_${email}`); return res.status(400).json({ error: "OTP expired. Please request a new one." }); }
    if (storedData.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email: email.toLowerCase().trim() }, data: { password: hashedPassword } });
    otpStore.delete(`reset_${email}`);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ============= AUTH ROUTES =============

// Register — auto welcome notification
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, gender, password } = req.body;
    if (!name || !email || !phone || !gender || !password) return res.status(400).json({ error: "All fields are required" });
    if (!["Male", "Female", "Other"].includes(gender)) return res.status(400).json({ error: "Invalid gender selection" });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, gender, password: hashedPassword }
    });

    // Auto welcome notification
    await prisma.notification.create({
      data: {
        title: "Welcome to Inscovia! 🎉",
        message: `Hi ${name}! Your account is ready. Browse top coaching centers, practice aptitude tests, and download previous year papers.`,
        type: "SUCCESS",
        userId: user.id
      }
    }).catch(() => {}); // silent fail — don't block registration

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

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ error: "Account is deactivated" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

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

// ============= NOTIFICATION ROUTES =============

// Get my notifications
router.get("/notifications", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark one as read
router.put("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    await prisma.notification.update({
      where: { id, userId },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Mark all as read
router.put("/notifications/read-all", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;