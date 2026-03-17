// backend/src/controllers/banner.controller.js
import prisma from "../lib/prisma.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// ─────────────────────────────────────────
// Slot limits per placement
// ─────────────────────────────────────────
const LIMITS = { HERO: 3, FEATURED: 4 };

// Pricing in paise (₹1 = 100 paise)
const PRICES = {
  HERO:     { 7: 49900, 15: 89900, 30: 149900 },
  FEATURED: { 7: 29900, 15: 59900, 30: 99900  }
};

// ─────────────────────────────────────────
// GET /api/banners/active?placement=HERO
// Public — fetch active banners for display
// ─────────────────────────────────────────
export const getActiveBanners = async (req, res) => {
  try {
    const { placement = "HERO" } = req.query;
    const now = new Date();

    const banners = await prisma.promotedBanner.findMany({
      where: {
        placement,
        isActive: true,
        startDate: { lte: now },
        endDate:   { gte: now }
      },
      include: {
        center: {
          select: {
            id: true, slug: true, name: true,
            city: true, state: true,
            logo: true, image: true,
            rating: true, primaryCategory: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ banners });
  } catch (error) {
    console.error("❌ Get banners error:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ─────────────────────────────────────────
// GET /api/banners/slots?placement=HERO
// Public — check available slots
// ─────────────────────────────────────────
export const getSlotAvailability = async (req, res) => {
  try {
    const { placement = "HERO" } = req.query;
    const now = new Date();

    const activeCount = await prisma.promotedBanner.count({
      where: {
        placement,
        isActive: true,
        endDate: { gte: now }
      }
    });

    const limit = LIMITS[placement] || 3;
    const available = Math.max(0, limit - activeCount);

    res.json({
      placement,
      limit,
      active: activeCount,
      available,
      isFull: available === 0,
      prices: PRICES[placement]
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to check slots" });
  }
};

// ─────────────────────────────────────────
// POST /api/banners/submit
// Institute submits a banner request
// Uses DB transaction to prevent overbooking
// ─────────────────────────────────────────
export const submitBanner = async (req, res) => {
  try {
    const { centerId, title, tagline, imageUrl, ctaText, placement, duration } = req.body;

    if (!centerId || !title || !duration || !placement) {
      return res.status(400).json({ error: "centerId, title, duration and placement are required" });
    }

    if (!PRICES[placement]?.[duration]) {
      return res.status(400).json({ error: "Invalid placement or duration" });
    }

    const amount = PRICES[placement][duration];

    // ✅ Atomic transaction — prevents race conditions
    const banner = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // Count active slots inside transaction
      const activeCount = await tx.promotedBanner.count({
        where: {
          placement,
          isActive: true,
          endDate: { gte: now }
        }
      });

      const limit = LIMITS[placement] || 3;

      // Check if full
      if (activeCount >= limit) {
        throw new Error("SLOTS_FULL");
      }

      // Count pending (submitted but not approved)
      const pendingCount = await tx.promotedBanner.count({
        where: {
          placement,
          isActive: false,
          isPaid: false,
          centerId
        }
      });

      // Prevent duplicate pending requests
      if (pendingCount > 0) {
        throw new Error("ALREADY_PENDING");
      }

      const startDate = now;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      return await tx.promotedBanner.create({
        data: {
          centerId,
          title,
          tagline:  tagline  || null,
          imageUrl: imageUrl || null,
          ctaText:  ctaText  || "View Institute",
          placement,
          duration,
          startDate,
          endDate,
          amount,
          isActive: false, // admin approves
          isPaid:   false
        }
      });
    });

    // Notify admin
    if (ADMIN_EMAIL && process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: "Inscovia Banners <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `New Banner Request — ${placement} (${duration} days)`,
        html: `
          <p>A new banner request has been submitted.</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Placement:</strong> ${placement}</p>
          <p><strong>Duration:</strong> ${duration} days</p>
          <p><strong>Amount:</strong> ₹${amount / 100}</p>
          <p>Please review and approve in the admin dashboard.</p>
        `
      }).catch(() => {});
    }

    res.json({ success: true, banner });

  } catch (error) {
    if (error.message === "SLOTS_FULL") {
      return res.status(409).json({
        error: "All slots are currently full.",
        isFull: true,
        message: "Please try again when a slot becomes available, or choose a different placement."
      });
    }
    if (error.message === "ALREADY_PENDING") {
      return res.status(409).json({
        error: "You already have a pending banner request for this placement.",
        isPending: true
      });
    }
    console.error("❌ Submit banner error:", error);
    res.status(500).json({ error: "Failed to submit banner" });
  }
};

// ─────────────────────────────────────────
// POST /api/banners/waitlist
// Join waitlist when slots are full
// ─────────────────────────────────────────
export const joinWaitlist = async (req, res) => {
  try {
    const { centerId, placement, duration, email, centerName } = req.body;

    if (!centerId || !placement || !email) {
      return res.status(400).json({ error: "centerId, placement and email required" });
    }

    // Store as a notification to admin
    await prisma.notification.create({
      data: {
        title: `Waitlist: ${centerName || centerId} wants ${placement} banner`,
        message: JSON.stringify({ centerId, placement, duration, email, centerName }),
        type: "INFO"
      }
    });

    res.json({ success: true, message: "You're on the waitlist! We'll email you when a slot opens." });
  } catch (error) {
    res.status(500).json({ error: "Failed to join waitlist" });
  }
};

// ─────────────────────────────────────────
// GET /api/banners/institute/:centerId
// Institute views their own banners
// ─────────────────────────────────────────
export const getInstituteBanners = async (req, res) => {
  try {
    const { centerId } = req.params;

    const banners = await prisma.promotedBanner.findMany({
      where: { centerId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ─────────────────────────────────────────
// GET /api/banners/admin/all
// Admin views all banners
// ─────────────────────────────────────────
export const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await prisma.promotedBanner.findMany({
      include: {
        center: {
          select: {
            id: true, name: true, city: true,
            slug: true, primaryCategory: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Add slot summary
    const now = new Date();
    const heroActive = banners.filter(b =>
      b.placement === "HERO" && b.isActive && new Date(b.endDate) >= now
    ).length;
    const featuredActive = banners.filter(b =>
      b.placement === "FEATURED" && b.isActive && new Date(b.endDate) >= now
    ).length;

    res.json({
      banners,
      slots: {
        HERO:     { active: heroActive,     limit: LIMITS.HERO,     available: LIMITS.HERO - heroActive },
        FEATURED: { active: featuredActive, limit: LIMITS.FEATURED, available: LIMITS.FEATURED - featuredActive }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ─────────────────────────────────────────
// PATCH /api/banners/admin/:id/approve
// Admin approves a banner
// ─────────────────────────────────────────
export const approveBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // Check slot limit before approving
    const banner = await prisma.promotedBanner.findUnique({ where: { id } });
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    const activeCount = await prisma.promotedBanner.count({
      where: {
        placement: banner.placement,
        isActive: true,
        endDate: { gte: now },
        id: { not: id }
      }
    });

    if (activeCount >= LIMITS[banner.placement]) {
      return res.status(409).json({
        error: `Cannot approve — ${banner.placement} slots are full (${LIMITS[banner.placement]}/${LIMITS[banner.placement]})`,
        isFull: true
      });
    }

    const updated = await prisma.promotedBanner.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ success: true, banner: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve banner" });
  }
};

// ─────────────────────────────────────────
// PATCH /api/banners/admin/:id/reject
// Admin rejects a banner
// ─────────────────────────────────────────
export const rejectBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.promotedBanner.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ success: true, banner: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject banner" });
  }
};

// ─────────────────────────────────────────
// DELETE /api/banners/admin/:id
// Admin deletes a banner
// ─────────────────────────────────────────
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.promotedBanner.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

// ─────────────────────────────────────────
// Auto-expire banners (called by cron)
// Also notifies waitlisted institutes
// ─────────────────────────────────────────
export const expireOldBanners = async () => {
  try {
    const now = new Date();
    const expired = await prisma.promotedBanner.updateMany({
      where: {
        isActive: true,
        endDate: { lt: now }
      },
      data: { isActive: false }
    });

    if (expired.count > 0) {
      console.log(`✅ Expired ${expired.count} banners`);

      // Notify admin that slots opened up
      if (ADMIN_EMAIL && process.env.RESEND_API_KEY) {
        resend.emails.send({
          from: "Inscovia Banners <onboarding@resend.dev>",
          to: ADMIN_EMAIL,
          subject: `${expired.count} banner slot(s) just opened`,
          html: `<p>${expired.count} banner(s) have expired and slots are now available. Check the waitlist in admin dashboard.</p>`
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("❌ Banner expiry error:", error);
  }
};