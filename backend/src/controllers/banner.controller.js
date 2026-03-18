// backend/src/controllers/banner.controller.js - FIXED
import prisma from "../lib/prisma.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const LIMITS = { HERO: 3, FEATURED: 4 };

const PRICES = {
  HERO:     { 7: 49900, 15: 89900, 30: 149900 },
  FEATURED: { 7: 29900, 15: 59900, 30: 99900  }
};

// GET /api/banners/active?placement=HERO
export const getActiveBanners = async (req, res) => {
  try {
    const { placement = "HERO" } = req.query;
    const now = new Date();

    // ✅ FIXED: prisma.banner (was prisma.promotedBanner — model doesn't exist)
    const banners = await prisma.banner.findMany({
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

// GET /api/banners/slots?placement=HERO
export const getSlotAvailability = async (req, res) => {
  try {
    const { placement = "HERO" } = req.query;
    const now = new Date();

    // ✅ FIXED: prisma.banner
    const activeCount = await prisma.banner.count({
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

// POST /api/banners/submit
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

    // ✅ FIXED: prisma.banner inside transaction
    const banner = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const activeCount = await tx.banner.count({
        where: {
          placement,
          isActive: true,
          endDate: { gte: now }
        }
      });

      const limit = LIMITS[placement] || 3;

      if (activeCount >= limit) {
        throw new Error("SLOTS_FULL");
      }

      const pendingCount = await tx.banner.count({
        where: {
          placement,
          isActive: false,
          centerId
        }
      });

      if (pendingCount > 0) {
        throw new Error("ALREADY_PENDING");
      }

      const startDate = now;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);

      return await tx.banner.create({
        data: {
          centerId,
          title,
          tagline:   tagline  || null,
          imageUrl:  imageUrl || null,
          ctaText:   ctaText  || "View Institute",
          placement,
          duration,
          startDate,
          endDate,
          pricePaise: amount,
          isActive: false,
        }
      });
    });

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

// POST /api/banners/waitlist
export const joinWaitlist = async (req, res) => {
  try {
    const { centerId, placement, duration, email, centerName } = req.body;

    if (!centerId || !placement || !email) {
      return res.status(400).json({ error: "centerId, placement and email required" });
    }

    await prisma.notification.create({
      data: {
        title: `Waitlist: ${centerName || centerId} wants ${placement} banner`,
        message: JSON.stringify({ centerId, placement, duration, email, centerName }),
        type: "INFO"
      }
    });

    res.json({ success: true, message: "You're on the waitlist! We'll notify you when a slot opens." });
  } catch (error) {
    res.status(500).json({ error: "Failed to join waitlist" });
  }
};

// GET /api/banners/institute/:centerId
export const getInstituteBanners = async (req, res) => {
  try {
    const { centerId } = req.params;

    // ✅ FIXED: prisma.banner
    const banners = await prisma.banner.findMany({
      where: { centerId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// GET /api/banners/admin/all
export const getAllBannersAdmin = async (req, res) => {
  try {
    // ✅ FIXED: prisma.banner
    const banners = await prisma.banner.findMany({
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

// PATCH /api/banners/admin/:id/approve
export const approveBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // ✅ FIXED: prisma.banner
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    const activeCount = await prisma.banner.count({
      where: {
        placement: banner.placement,
        isActive: true,
        endDate: { gte: now },
        id: { not: id }
      }
    });

    if (activeCount >= LIMITS[banner.placement]) {
      return res.status(409).json({
        error: `Cannot approve — ${banner.placement} slots are full`,
        isFull: true
      });
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ success: true, banner: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve banner" });
  }
};

// PATCH /api/banners/admin/:id/reject
export const rejectBanner = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ FIXED: prisma.banner
    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ success: true, banner: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject banner" });
  }
};

// DELETE /api/banners/admin/:id
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ FIXED: prisma.banner
    await prisma.banner.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

// Auto-expire banners (called by cron)
export const expireOldBanners = async () => {
  try {
    const now = new Date();
    // ✅ FIXED: prisma.banner
    const expired = await prisma.banner.updateMany({
      where: {
        isActive: true,
        endDate: { lt: now }
      },
      data: { isActive: false }
    });

    if (expired.count > 0) {
      console.log(`✅ Expired ${expired.count} banners`);

      if (ADMIN_EMAIL && process.env.RESEND_API_KEY) {
        resend.emails.send({
          from: "Inscovia Banners <onboarding@resend.dev>",
          to: ADMIN_EMAIL,
          subject: `${expired.count} banner slot(s) just opened`,
          html: `<p>${expired.count} banner(s) have expired and slots are now available.</p>`
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("❌ Banner expiry error:", error);
  }
};