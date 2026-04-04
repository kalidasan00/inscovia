// backend/src/controllers/auth.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import { geocodeCity } from "../utils/geocode.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const otpStore = new Map();
const resetTokenStore = new Map();

// Auto-cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) { otpStore.delete(key); }
  }
  for (const [key, value] of resetTokenStore.entries()) {
    if (now > value.expiresAt) { resetTokenStore.delete(key); }
  }
}, 10 * 60 * 1000);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

function generateSlug(name, city) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ts = Date.now().toString(36);
  return `${base}-${citySlug}-${ts}`;
}

const validCategories = [
  'SCHOOL_TUITION', 'STUDY_ABROAD', 'LANGUAGES', 'IT_TECHNOLOGY',
  'DESIGN_CREATIVE', 'MANAGEMENT', 'SKILL_DEVELOPMENT', 'EXAM_COACHING',
];
const validModes = ['ONLINE', 'OFFLINE', 'HYBRID'];

// ─── OTP ─────────────────────────────────────────────────────────────────────

export const sendOTP = async (req, res) => {
  try {
    const { email, instituteName } = req.body;
    if (!email || !instituteName) {
      return res.status(400).json({ error: "Email and institute name are required" });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt, instituteName });
    await sendOTPEmail(email, otp, instituteName);
    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: "OTP sent successfully", expiresIn: 600 });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
    const storedData = otpStore.get(email);
    if (!storedData) return res.status(400).json({ error: "OTP not found or expired." });
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }
    if (storedData.otp !== otp) return res.status(400).json({ error: "Invalid OTP." });
    otpStore.delete(email);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.json({ success: true, message: "If an account exists, you will receive a reset link" });
    const resetToken = generateResetToken();
    const expiresAt = Date.now() + 60 * 60 * 1000;
    resetTokenStore.set(resetToken, { email: user.email, expiresAt });
    await sendPasswordResetEmail(user.email, resetToken, user.name);
    res.json({ success: true, message: "If an account exists, you will receive a reset link" });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request." });
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });
    const tokenData = resetTokenStore.get(token);
    if (!tokenData) return res.status(400).json({ error: "Invalid or expired reset token" });
    if (Date.now() > tokenData.expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }
    res.json({ success: true, message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
    const tokenData = resetTokenStore.get(token);
    if (!tokenData) return res.status(400).json({ error: "Invalid or expired reset token" });
    if (Date.now() > tokenData.expiresAt) {
      resetTokenStore.delete(token);
      return res.status(400).json({ error: "Reset token has expired" });
    }
    const user = await prisma.user.findUnique({ where: { email: tokenData.email } });
    if (!user) { resetTokenStore.delete(token); return res.status(404).json({ error: "User not found" }); }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    resetTokenStore.delete(token);
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

// ─── REGISTER INSTITUTE ───────────────────────────────────────────────────────

export const registerInstitute = async (req, res) => {
  try {
    const {
      instituteName, email, phone, password,
      primaryCategory, secondaryCategories = [],
      teachingMode, state, district, city, location,
      otpVerified
    } = req.body;

    if (!instituteName || !email || !phone || !password || !primaryCategory ||
        !state || !district || !city || !location) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }
    if (!validCategories.includes(primaryCategory)) {
      return res.status(400).json({ error: "Invalid primary category" });
    }
    const resolvedTeachingMode = teachingMode || 'OFFLINE';
    if (!validModes.includes(resolvedTeachingMode)) {
      return res.status(400).json({ error: "Invalid teaching mode" });
    }
    if (secondaryCategories.length > 2) {
      return res.status(400).json({ error: "Maximum 2 secondary categories allowed" });
    }
    if (secondaryCategories.some(cat => !validCategories.includes(cat))) {
      return res.status(400).json({ error: "Invalid secondary category" });
    }
    if (secondaryCategories.includes(primaryCategory)) {
      return res.status(400).json({ error: "Primary category cannot be a secondary category" });
    }

    const coords = await geocodeCity(city, district, state);
    const orgSlug = generateSlug(instituteName, city);
    const centerSlug = generateSlug(instituteName, city);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const result = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: instituteName, slug: orgSlug,
            primaryCategory, secondaryCategories,
            teachingMode: resolvedTeachingMode,
            state, district, city, location,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
          }
        });
        await tx.orgMember.create({
          data: { userId: existingUser.id, orgId: org.id, role: "OWNER", status: "ACTIVE" }
        });
        const center = await tx.center.create({
          data: {
            name: instituteName, slug: centerSlug,
            primaryCategory, secondaryCategories,
            teachingMode: resolvedTeachingMode,
            state, district, city, location,
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
            description: `Welcome to ${instituteName}!`,
            phone, email, rating: 0,
            courses: [], courseDetails: [], gallery: [],
            orgId: org.id,
          }
        });
        return { org, center };
      });

      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, orgId: result.org.id },
        JWT_SECRET, { expiresIn: "7d" }
      );
      console.log(`✅ New org for existing user: ${email} → ${instituteName}`);
      return res.status(201).json({
        success: true, message: "Organization created successfully", token,
        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
        organization: { id: result.org.id, name: result.org.name, slug: result.org.slug },
        center: { id: result.center.id, slug: result.center.slug, name: result.center.name }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: instituteName, email, phone,
          password: hashedPassword,
          isVerified: otpVerified || false,
          role: "USER",
        }
      });
      const org = await tx.organization.create({
        data: {
          name: instituteName, slug: orgSlug,
          primaryCategory, secondaryCategories,
          teachingMode: resolvedTeachingMode,
          state, district, city, location,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        }
      });
      await tx.orgMember.create({
        data: { userId: user.id, orgId: org.id, role: "OWNER", status: "ACTIVE" }
      });
      const center = await tx.center.create({
        data: {
          name: instituteName, slug: centerSlug,
          primaryCategory, secondaryCategories,
          teachingMode: resolvedTeachingMode,
          state, district, city, location,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          description: `Welcome to ${instituteName}! ${
            primaryCategory === 'STUDY_ABROAD'
              ? `We are a study abroad consultancy in ${city}, ${state}.`
              : `We are a ${primaryCategory.toLowerCase().replace(/_/g, ' ')} institute in ${city}, ${state}.`
          }`,
          phone, email, rating: 0,
          courses: [], courseDetails: [], gallery: [],
          orgId: org.id,
        }
      });
      return { user, org, center };
    });

    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, orgId: result.org.id },
      JWT_SECRET, { expiresIn: "7d" }
    );

    console.log(`✅ Institute registered: ${instituteName} (${email})`);
    res.status(201).json({
      success: true, message: "Institute registered successfully", token,
      user: { id: result.user.id, name: result.user.name, email: result.user.email, phone: result.user.phone },
      organization: {
        id: result.org.id, name: result.org.name, slug: result.org.slug,
        primaryCategory: result.org.primaryCategory, secondaryCategories: result.org.secondaryCategories,
        teachingMode: result.org.teachingMode, state: result.org.state,
        district: result.org.district, city: result.org.city, location: result.org.location,
      },
      center: { id: result.center.id, slug: result.center.slug, name: result.center.name }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export const loginInstitute = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orgMemberships: {
          where: { status: "ACTIVE" },
          include: {
            org: {
              include: {
                centers: {
                  select: {
                    id: true, slug: true, name: true,
                    image: true, logo: true, rating: true,
                    city: true, state: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ error: "Account is deactivated" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.orgMemberships.length) {
      return res.status(403).json({ error: "No organization found for this account" });
    }

    const firstOrg = user.orgMemberships[0].org;

    const token = jwt.sign(
      { id: user.id, email: user.email, orgId: firstOrg.id },
      JWT_SECRET, { expiresIn: "7d" }
    );

    console.log(`✅ Login: ${email}`);
    res.json({
      success: true, message: "Login successful", token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, isVerified: user.isVerified },
      organizations: user.orgMemberships.map(m => ({
        id: m.org.id, name: m.org.name, slug: m.org.slug,
        role: m.role, primaryCategory: m.org.primaryCategory,
        city: m.org.city, centers: m.org.centers,
      })),
      organization: {
        id: firstOrg.id, name: firstOrg.name, slug: firstOrg.slug,
        primaryCategory: firstOrg.primaryCategory,
        secondaryCategories: firstOrg.secondaryCategories,
        teachingMode: firstOrg.teachingMode,
        state: firstOrg.state, district: firstOrg.district,
        city: firstOrg.city, location: firstOrg.location,
      },
      center: firstOrg.centers?.[0] || null,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, email: true,
        phone: true, isVerified: true, createdAt: true,
        orgMemberships: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            role: true,
            org: {
              select: {
                id: true, name: true, slug: true,
                primaryCategory: true, secondaryCategories: true,
                teachingMode: true, state: true, district: true,
                city: true, location: true, latitude: true, longitude: true,
                centers: {
                  select: {
                    id: true, slug: true, name: true,
                    // ✅ ADDED: orgId so frontend TeamSection can use it
                    orgId: true,
                    primaryCategory: true, secondaryCategories: true,
                    teachingMode: true, state: true, district: true,
                    city: true, location: true, latitude: true, longitude: true,
                    description: true, rating: true,
                    courses: true, courseDetails: true,
                    image: true, logo: true, gallery: true,
                    website: true, whatsapp: true, phone: true, email: true,
                    facebook: true, instagram: true, linkedin: true,
                    countries: true, services: true, topUniversities: true,
                    avgScholarship: true, successRate: true, studentsPlaced: true,
                    createdAt: true, updatedAt: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Use orgId from token to find active org
    const activeOrgId = req.orgId;
    const activeMembership = activeOrgId
      ? user.orgMemberships.find(m => m.org.id === activeOrgId)
      : user.orgMemberships[0];

    const activeOrg = activeMembership?.org || null;
    const center = activeOrg?.centers?.[0] || null;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        // ✅ Backward compat with existing frontend
        instituteName: activeOrg?.name || user.name,
        primaryCategory: activeOrg?.primaryCategory,
        secondaryCategories: activeOrg?.secondaryCategories,
        teachingMode: activeOrg?.teachingMode,
        state: activeOrg?.state,
        district: activeOrg?.district,
        city: activeOrg?.city,
        location: activeOrg?.location,
        // ✅ ADDED: role for TeamSection currentUserRole
        role: activeMembership?.role || null,
      },
      center,
      // ✅ ADDED: membership with role for frontend
      membership: {
        id: activeMembership?.id || null,
        role: activeMembership?.role || null,
      },
      organization: activeOrg,
      organizations: user.orgMemberships.map(m => ({
        id: m.org.id, name: m.org.name, slug: m.org.slug,
        role: m.role, primaryCategory: m.org.primaryCategory,
        city: m.org.city,
      })),
    });
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};