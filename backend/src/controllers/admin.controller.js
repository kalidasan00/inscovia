// backend/src/controllers/admin.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── Admin Login ─────────────────────────────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, name: true, email: true, password: true,
        role: true, adminRole: true, permissions: true, isActive: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }
    if (!admin.isActive) {
      return res.status(403).json({ error: "Admin account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, adminRole: admin.adminRole, permissions: admin.permissions },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, adminRole: admin.adminRole, permissions: admin.permissions },
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// ─── Create Admin (SUPER_ADMIN only) ─────────────────────────────────────────
export const createAdmin = async (req, res) => {
  try {
    if (req.adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Super Admin can create admins" });
    }

    const { name, email, password, phone, permissions } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        name, email, password: hashed, phone: phone || "",
        role: "ADMIN", adminRole: "ADMIN",
        permissions: permissions || [],
        isVerified: true, isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, adminRole: true, permissions: true, isActive: true, createdAt: true },
    });

    res.status(201).json({ success: true, admin });
  } catch (error) {
    console.error("❌ Create admin error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
};

// ─── Get All Admins (SUPER_ADMIN only) ───────────────────────────────────────
export const getAllAdmins = async (req, res) => {
  try {
    if (req.adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Super Admin can view admins" });
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, adminRole: true, permissions: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ admins });
  } catch (error) {
    console.error("❌ Get admins error:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// ─── Update Admin Permissions (SUPER_ADMIN only) ─────────────────────────────
export const updateAdminPermissions = async (req, res) => {
  try {
    if (req.adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Super Admin can update permissions" });
    }

    const { id } = req.params;
    const { permissions, isActive } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(permissions !== undefined && { permissions }),
        ...(isActive !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, adminRole: true, permissions: true, isActive: true },
    });

    res.json({ success: true, admin: updated });
  } catch (error) {
    console.error("❌ Update permissions error:", error);
    res.status(500).json({ error: "Failed to update permissions" });
  }
};

// ─── Delete Admin (SUPER_ADMIN only) ─────────────────────────────────────────
export const deleteAdmin = async (req, res) => {
  try {
    if (req.adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only Super Admin can delete admins" });
    }

    const { id } = req.params;

    // ✅ Prevent self-deletion
    if (id === req.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // ✅ Verify target exists
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ error: "Admin not found" });
    }

    await prisma.user.delete({ where: { id } });

    console.log(`✅ Admin deleted: ${target.email} by ${req.userId}`);
    res.json({ success: true, message: `Admin ${target.email} deleted` });
  } catch (error) {
    console.error("❌ deleteAdmin error:", error);
    res.status(500).json({ error: "Failed to delete admin" });
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalCenters, totalUsers, totalReviews, recentCenters, recentReviews] = await Promise.all([
      prisma.center.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.review.count(),
      prisma.center.findMany({
        take: 5, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, city: true, createdAt: true },
      }),
      prisma.review.findMany({
        take: 5, orderBy: { createdAt: "desc" },
        include: { center: { select: { name: true } } },
      }),
    ]);

    res.json({ stats: { totalCenters, totalUsers, totalReviews }, recentCenters, recentReviews });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// ─── Institutes ───────────────────────────────────────────────────────────────
export const getAllInstitutes = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;

    const institutes = await prisma.organization.findMany({
      where,
      include: { _count: { select: { centers: true, members: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ institutes });
  } catch (error) {
    console.error("❌ Get institutes error:", error);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
};

export const approveInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await prisma.organization.update({ where: { id }, data: { isActive: true } });
    res.json({ success: true, institute });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve institute" });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.organization.delete({ where: { id } });
    res.json({ success: true, message: "Institute deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete institute" });
  }
};

export const toggleInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) return res.status(404).json({ error: "Institute not found" });
    const updated = await prisma.organization.update({ where: { id }, data: { isActive: !org.isActive } });
    res.json({ success: true, institute: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle status" });
  }
};

// ─── Centers ──────────────────────────────────────────────────────────────────
export const getAllCenters = async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      include: { org: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ centers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch centers" });
  }
};

export const deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.center.delete({ where: { id } });
    res.json({ success: true, message: "Center deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete center" });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          role: "USER",
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : { role: "USER" };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, gender: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const updated = await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle user status" });
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalCenters, totalUsers, totalReviews,
      totalPapers, totalAptitude,
      centersByCategory, centersByState, centersByMode,
      topCenters, reviewsByRating,
      papersByCategory, aptitudeByTopic,
      recentUsers, recentCenters,
      paperDownloads,
    ] = await Promise.all([
      prisma.center.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.review.count(),
      prisma.previousYearPaper.count(),
      prisma.aptitudeQuestion.count(),
      prisma.center.groupBy({ by: ["primaryCategory"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.center.groupBy({ by: ["state"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
      prisma.center.groupBy({ by: ["teachingMode"], _count: { id: true } }),
      prisma.center.findMany({
        where: { rating: { gt: 0 } }, orderBy: { rating: "desc" }, take: 5,
        select: { id: true, name: true, city: true, rating: true, primaryCategory: true },
      }),
      prisma.review.groupBy({ by: ["rating"], _count: { id: true }, orderBy: { rating: "desc" } }),
      prisma.previousYearPaper.groupBy({ by: ["examCategory"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
      prisma.aptitudeQuestion.groupBy({ by: ["topic"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8 }),
      prisma.user.findMany({
        where: { role: "USER", createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }, orderBy: { createdAt: "asc" },
      }),
      prisma.center.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }, orderBy: { createdAt: "asc" },
      }),
      prisma.previousYearPaper.aggregate({ _sum: { downloads: true } }),
    ]);

    const groupByDay = (items) => {
      const map = {};
      items.forEach(item => {
        const day = item.createdAt.toISOString().split("T")[0];
        map[day] = (map[day] || 0) + 1;
      });
      const result = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split("T")[0];
        result.push({ date: key, count: map[key] || 0 });
      }
      return result;
    };

    res.json({
      overview: {
        totalCenters, totalUsers, totalReviews,
        totalPapers, totalAptitude,
        totalDownloads: paperDownloads._sum.downloads || 0,
      },
      centersByCategory: centersByCategory.map(c => ({ name: c.primaryCategory, count: c._count.id })),
      centersByState: centersByState.map(c => ({ name: c.state, count: c._count.id })),
      centersByMode: centersByMode.map(c => ({ name: c.teachingMode, count: c._count.id })),
      topCenters,
      reviewsByRating: reviewsByRating.map(r => ({ rating: r.rating, count: r._count.id })),
      papersByCategory: papersByCategory.map(p => ({ name: p.examCategory, count: p._count.id })),
      aptitudeByTopic: aptitudeByTopic.map(a => ({ name: a.topic, count: a._count.id })),
      growth: {
        users: groupByDay(recentUsers),
        centers: groupByDay(recentCenters),
      },
    });
  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const sendNotification = async (req, res) => {
  try {
    const { title, message, type = "INFO", userId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (userId) {
      const notification = await prisma.notification.create({ data: { title, message, type, userId } });
      return res.json({ success: true, notification });
    }

    const users = await prisma.user.findMany({ where: { role: "USER" }, select: { id: true } });
    await prisma.notification.createMany({ data: users.map(u => ({ title, message, type, userId: u.id })) });
    return res.json({ success: true, message: `Sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};