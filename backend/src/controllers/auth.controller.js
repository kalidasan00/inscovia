// backend/src/controllers/auth.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/emailService.js";

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    // Send email
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

    // OTP is valid - remove from store
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

// ============= REGISTER INSTITUTE (UPDATED) =============

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

      // Create corresponding center
      const center = await tx.center.create({
        data: {
          name: instituteName,
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
        name: result.center.name
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message
    });
  }
};

// ============= LOGIN INSTITUTE (UPDATED) =============

// Login Institute
export const loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user with their center
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
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ============= GET CURRENT USER (UPDATED) =============

// Get Current User with Centers
export const getCurrentUser = async (req, res) => {
  try {
    console.log("Getting user with ID:", req.userId);

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

    console.log("User found:", user.instituteName);
    console.log("Centers count:", user.centers.length);

    const center = user.centers && user.centers.length > 0 ? user.centers[0] : null;

    if (!center) {
      console.log("WARNING: No center found for user", user.instituteName);
    }

    res.json({
      user,
      center
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};