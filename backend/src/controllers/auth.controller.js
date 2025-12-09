// backend/src/controllers/auth.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Institute
export const registerInstitute = async (req, res) => {
  try {
    const {
      instituteName,
      email,
      phone,
      password,
      type,
      state,
      district,
      city,
      location
    } = req.body;

    // Validation
    if (!instituteName || !email || !phone || !password || !type || !state || !district || !city || !location) {
      return res.status(400).json({ error: "All fields are required" });
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
          type,
          state,
          district,
          city,
          location
        }
      });

      // Create corresponding center
      const center = await tx.center.create({
        data: {
          name: instituteName,
          type: type,
          state: state,
          district: district,
          city: city,
          location: location,
          description: `Welcome to ${instituteName}! We are a ${type} located in ${city}, ${state}.`,
          phone: phone,
          email: email,
          rating: 0,
          courses: [], // Empty initially
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
        type: result.instituteUser.type,
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
    res.status(500).json({ error: "Registration failed" });
  }
};

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
        type: user.type,
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

// Get Current User with Centers - FIXED VERSION
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.instituteUser.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        instituteName: true,
        email: true,
        phone: true,
        type: true,
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
            type: true,
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

    res.json({
      user,
      center: user.centers[0] || null // Return first center if exists
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};