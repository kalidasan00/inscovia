// backend/src/controllers/auth.controller.js - OPTIMIZED VERSION
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailService.js";

// ✅ OPTIMIZED: Store OTPs and Reset Tokens temporarily
// TODO: For production scale (1000+ users), migrate to Redis for better performance
const otpStore = new Map();
const resetTokenStore = new Map();

// ✅ NEW: Auto-cleanup expired entries every 10 minutes (prevents memory leak)
setInterval(() => {
  const now = Date.now();

  // Clean expired OTPs
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
      console.log(`🧹 Cleaned expired OTP for ${key}`);
    }
  }

  // Clean expired reset tokens
  for (const [key, value] of resetTokenStore.entries()) {
    if (now > value.expiresAt) {
      resetTokenStore.delete(key);
      console.log(`🧹 Cleaned expired reset token`);
    }
  }
}, 10 * 60 * 1000);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ✅ OPTIMIZED: Generate unique slug with timestamp (no database loop)
const generateUniqueSlug = (instituteName, city) => {
  const baseSlug = instituteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const citySlug = city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  // Use timestamp for uniqueness (no race condition, no loop)
  const timestamp = Date.now().toString(36); // Base36 = shorter
  return `${baseSlug}-${citySlug}-${timestamp}`;
};

// ============= OTP FUNCTIONS =============

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email, instituteName } = req.body;

    if (!email || !instituteName) {
      return res.status(400).json({ error: "Email and institute name are required" });
    }

    // Check if email already exists
    const existingUser = await prisma.instituteUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expiresAt, instituteName });

    // Send email (non-blocking - don't wait unnecessarily)
    await sendOTPEmail(email, otp, instituteName);

    console.log(`✅ OTP sent to ${email}: ${otp}`); // For testing

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
      expiresIn: 600
    });

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Get stored OTP
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: "OTP not found or expired. Please request a new one." });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // ✅ OPTIMIZED: OTP is valid - remove from store immediately
    otpStore.delete(email);

    console.log(`✅ OTP verified for ${email}`);

    res.json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// ============= FORGOT PASSWORD FUNCTIONS =============

// Forgot Password - Send Reset Email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = await prisma.instituteUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link"
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Store reset token
    resetTokenStore.set(resetToken, {
      email: user.email,
      expiresAt
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.instituteName);

    console.log(`✅ Password reset email sent to ${user.email}`);
    console.log(`🔑 Reset token: ${resetToken}`); // For testing

    res.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link"
    });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request. Please try again." });
  }
};

// Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Get stored token data
    const tokenData = resetTokenStore.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token expired
    if (Date.now() > tokenData.expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    res.json({
      success: true,
      message: "Token is valid"
    });

  } catch (error) {
    console.error("❌ Verify token error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Get stored token data
    const tokenData = resetTokenStore.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token expired
    if (Date.now() > tokenData.expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Find user
    const user = await prisma.instituteUser.findUnique({
      where: { email: tokenData.email }
    });

    if (!user) {
      resetTokenStore.delete(token);
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await prisma.instituteUser.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // ✅ OPTIMIZED: Remove used token immediately
    resetTokenStore.delete(token);

    console.log(`✅ Password reset successful for ${user.email}`);

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};

// ============= REGISTER INSTITUTE =============

// Register Institute
export const registerInstitute = async (req, res) => {
  try {
    const {
      instituteName,
      email,
      phone,
      password,
      primaryCategory,
      secondaryCategories = [],
      teachingMode,
      state,
      district,
      city,
      location,
      otpVerified
    } = req.body;

    // Validation
    if (!instituteName || !email || !phone || !password || !primaryCategory ||
        !teachingMode || !state || !district || !city || !location) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Validate primary category
    const validCategories = ['TECHNOLOGY', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING'];
    if (!validCategories.includes(primaryCategory)) {
      return res.status(400).json({ error: "Invalid primary category" });
    }

    // Validate teaching mode
    const validModes = ['ONLINE', 'OFFLINE', 'HYBRID'];
    if (!validModes.includes(teachingMode)) {
      return res.status(400).json({ error: "Invalid teaching mode" });
    }

    // Validate secondary categories (optional)
    if (secondaryCategories.length > 2) {
      return res.status(400).json({ error: "Maximum 2 secondary categories allowed" });
    }

    if (secondaryCategories.some(cat => !validCategories.includes(cat))) {
      return res.status(400).json({ error: "Invalid secondary category" });
    }

    if (secondaryCategories.includes(primaryCategory)) {
      return res.status(400).json({ error: "Primary category cannot be a secondary category" });
    }

    // Check if email already exists
    const existingUser = await prisma.instituteUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ OPTIMIZED: Generate unique slug BEFORE transaction (faster, no race condition)
    const slug = generateUniqueSlug(instituteName, city);

    // Create institute user AND center in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create institute user
      const instituteUser = await tx.instituteUser.create({
        data: {
          instituteName,
          email,
          phone,
          password: hashedPassword,
          primaryCategory,
          secondaryCategories,
          teachingMode,
          state,
          district,
          city,
          location,
          isVerified: otpVerified || false
        }
      });

      // ✅ OPTIMIZED: Create center with pre-generated slug (no database loop!)
      const center = await tx.center.create({
        data: {
          name: instituteName,
          slug: slug,
          primaryCategory,
          secondaryCategories,
          teachingMode,
          state,
          district,
          city,
          location,
          description: `Welcome to ${instituteName}! We are a ${primaryCategory.toLowerCase().replace('_', ' ')} institute located in ${city}, ${state}.`,
          phone,
          email,
          rating: 0,
          courses: [],
          courseDetails: [],
          gallery: [],
          userId: instituteUser.id
        }
      });

      return { instituteUser, center };
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: result.instituteUser.id, email: result.instituteUser.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log(`✅ Institute registered: ${instituteName} (${email})`);

    // Return user data
    res.status(201).json({
      success: true,
      message: "Institute registered successfully",
      token,
      user: {
        id: result.instituteUser.id,
        instituteName: result.instituteUser.instituteName,
        email: result.instituteUser.email,
        phone: result.instituteUser.phone,
        primaryCategory: result.instituteUser.primaryCategory,
        secondaryCategories: result.instituteUser.secondaryCategories,
        teachingMode: result.instituteUser.teachingMode,
        location: {
          state: result.instituteUser.state,
          district: result.instituteUser.district,
          city: result.instituteUser.city,
          location: result.instituteUser.location
        }
      },
      center: {
        id: result.center.id,
        slug: result.center.slug,
        name: result.center.name
      }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message
    });
  }
};

// ============= LOGIN INSTITUTE =============

// Login Institute
export const loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // ✅ OPTIMIZED: Find user with their center in one query
    const user = await prisma.instituteUser.findUnique({
      where: { email },
      include: {
        centers: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log(`✅ Login successful: ${user.instituteName} (${email})`);

    // Return user data
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        instituteName: user.instituteName,
        email: user.email,
        phone: user.phone,
        primaryCategory: user.primaryCategory,
        secondaryCategories: user.secondaryCategories,
        teachingMode: user.teachingMode,
        location: {
          state: user.state,
          district: user.district,
          city: user.city,
          location: user.location
        }
      },
      centers: user.centers
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ============= GET CURRENT USER =============

// Get Current User with Centers
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.instituteUser.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        instituteName: true,
        email: true,
        phone: true,
        primaryCategory: true,
        secondaryCategories: true,
        teachingMode: true,
        state: true,
        district: true,
        city: true,
        location: true,
        isVerified: true,
        createdAt: true,
        centers: {
          select: {
            id: true,
            slug: true,
            name: true,
            primaryCategory: true,
            secondaryCategories: true,
            teachingMode: true,
            state: true,
            district: true,
            city: true,
            location: true,
            description: true,
            rating: true,
            courses: true,
            courseDetails: true,
            image: true,
            logo: true,
            gallery: true,
            website: true,
            whatsapp: true,
            phone: true,
            email: true,
            facebook: true,
            instagram: true,
            linkedin: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const center = user.centers && user.centers.length > 0 ? user.centers[0] : null;

    if (!center) {
      console.log("⚠️ No center found for user:", user.instituteName);
    }

    res.json({
      user,
      center
    });
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};