// backend/src/controllers/banner.controller.js
import prisma from "../lib/prisma.js";

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
        endDate: { gte: now }
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
// POST /api/banners/submit
// Institute submits a banner request
// ─────────────────────────────────────────
export const submitBanner = async (req, res) => {
  try {
    const { centerId, title, tagline, imageUrl, ctaText, placement, duration } = req.body;

    if (!centerId || !title || !duration || !placement) {
      return res.status(400).json({ error: "centerId, title, duration and placement are required" });
    }

    // Pricing
    const PRICES = {
      HERO: { 7: 49900, 15: 89900, 30: 149900 },
      FEATURED: { 7: 29900, 15: 59900, 30: 99900 }
    };

    const amount = PRICES[placement]?.[duration];
    if (!amount) {
      return res.status(400).json({ error: "Invalid placement or duration" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const banner = await prisma.promotedBanner.create({
      data: {
        centerId,
        title,
        tagline: tagline || null,
        imageUrl: imageUrl || null,
        ctaText: ctaText || "View Institute",
        placement,
        duration,
        startDate,
        endDate,
        amount,
        isActive: false, // needs admin approval
        isPaid: false
      }
    });

    res.json({ success: true, banner });
  } catch (error) {
    console.error("❌ Submit banner error:", error);
    res.status(500).json({ error: "Failed to submit banner" });
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

    res.json({ banners });
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

    const banner = await prisma.promotedBanner.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve banner" });
  }
};

// ─────────────────────────────────────────
// PATCH /api/banners/admin/:id/reject
// Admin rejects/deactivates a banner
// ─────────────────────────────────────────
export const rejectBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.promotedBanner.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true, banner });
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
    }
  } catch (error) {
    console.error("❌ Banner expiry error:", error);
  }
};