// backend/src/controllers/admin.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Admin login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await prisma.instituteUser.findUnique({ where: { email } });

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
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin.id, name: admin.instituteName, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCenters,
      totalInstitutes,
      pendingInstitutes,
      activeInstitutes,
      totalUsers,
      recentCenters,
      recentReviews
    ] = await Promise.all([
      prisma.center.count(),
      prisma.instituteUser.count({ where: { role: "INSTITUTE" } }),
      prisma.instituteUser.count({ where: { role: "INSTITUTE", isVerified: false } }),
      prisma.instituteUser.count({ where: { role: "INSTITUTE", isActive: true } }),
      prisma.user.count(),
      prisma.center.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { instituteName: true, email: true } } }
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { center: { select: { name: true } } }
      })
    ]);

    res.json({
      stats: { totalCenters, totalInstitutes, pendingInstitutes, activeInstitutes, totalUsers },
      recentCenters,
      recentReviews
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// Get All Institutes
export const getAllInstitutes = async (req, res) => {
  try {
    const { status } = req.query;
    let where = { role: "INSTITUTE" };

    if (status === "pending") where.isVerified = false;
    else if (status === "verified") where.isVerified = true;
    else if (status === "active") { where.isActive = true; where.isVerified = true; }
    else if (status === "inactive") where.isActive = false;

    const institutes = await prisma.instituteUser.findMany({
      where,
      include: { _count: { select: { centers: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ institutes });
  } catch (error) {
    console.error("Get institutes error:", error);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
};

// Approve Institute
export const approveInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await prisma.instituteUser.update({
      where: { id },
      data: { isVerified: true, isActive: true }
    });
    res.json({ success: true, message: "Institute approved successfully", institute });
  } catch (error) {
    console.error("Approve institute error:", error);
    res.status(500).json({ error: "Failed to approve institute" });
  }
};

// Delete Institute
export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.instituteUser.delete({ where: { id } });
    res.json({ success: true, message: "Institute deleted successfully" });
  } catch (error) {
    console.error("Delete institute error:", error);
    res.status(500).json({ error: "Failed to delete institute" });
  }
};

// Toggle Institute Active Status
export const toggleInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await prisma.instituteUser.findUnique({ where: { id } });
    if (!institute) return res.status(404).json({ error: "Institute not found" });

    const updated = await prisma.instituteUser.update({
      where: { id },
      data: { isActive: !institute.isActive }
    });

    res.json({
      success: true,
      message: `Institute ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      institute: updated
    });
  } catch (error) {
    console.error("Toggle status error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Get All Centers
export const getAllCenters = async (req, res) => {
  try {
    const centers = await prisma.center.findMany({
      include: {
        owner: {
          select: { instituteName: true, email: true, phone: true, isVerified: true, isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ centers });
  } catch (error) {
    console.error("Get centers error:", error);
    res.status(500).json({ error: "Failed to fetch centers" });
  }
};

// Delete Center
export const deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.center.delete({ where: { id } });
    res.json({ success: true, message: "Center deleted successfully" });
  } catch (error) {
    console.error("Delete center error:", error);
    res.status(500).json({ error: "Failed to delete center" });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } }
          ]
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users, total: users.length });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Toggle User Active Status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });

    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updated
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
};

// Get Analytics
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalInstitutes, verifiedInstitutes, pendingInstitutes,
      totalCenters, totalUsers, totalReviews, totalPapers, totalAptitude,
      institutesByCategory, institutesByState,
      centersByCategory, centersByState, centersByMode,
      topCenters, reviewsByRating, papersByCategory, aptitudeByTopic,
      recentUsers, recentInstitutes, recentCenters, paperDownloads
    ] = await Promise.all([
      prisma.instituteUser.count({ where: { role: "INSTITUTE" } }),
      prisma.instituteUser.count({ where: { role: "INSTITUTE", isVerified: true } }),
      prisma.instituteUser.count({ where: { role: "INSTITUTE", isVerified: false } }),
      prisma.center.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.previousYearPaper.count(),
      prisma.aptitudeQuestion.count(),

      prisma.instituteUser.groupBy({
        by: ["primaryCategory"], where: { role: "INSTITUTE" },
        _count: { id: true }, orderBy: { _count: { id: "desc" } }
      }),
      prisma.instituteUser.groupBy({
        by: ["state"], where: { role: "INSTITUTE" },
        _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8
      }),
      prisma.center.groupBy({
        by: ["primaryCategory"],
        _count: { id: true }, orderBy: { _count: { id: "desc" } }
      }),
      prisma.center.groupBy({
        by: ["state"],
        _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8
      }),
      prisma.center.groupBy({
        by: ["teachingMode"],
        _count: { id: true }
      }),
      prisma.center.findMany({
        where: { rating: { gt: 0 } },
        orderBy: { rating: "desc" }, take: 5,
        select: { id: true, name: true, city: true, rating: true, primaryCategory: true }
      }),
      prisma.review.groupBy({
        by: ["rating"],
        _count: { id: true },
        orderBy: { rating: "desc" }
      }),
      prisma.previousYearPaper.groupBy({
        by: ["examCategory"],
        _count: { id: true }, orderBy: { _count: { id: "desc" } }
      }),
      prisma.aptitudeQuestion.groupBy({
        by: ["topic"],
        _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 8
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }, orderBy: { createdAt: "asc" }
      }),
      prisma.instituteUser.findMany({
        where: { role: "INSTITUTE", createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }, orderBy: { createdAt: "asc" }
      }),
      prisma.center.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true }, orderBy: { createdAt: "asc" }
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
        totalInstitutes, verifiedInstitutes, pendingInstitutes,
        totalCenters, totalUsers, totalReviews, totalPapers, totalAptitude,
        totalDownloads: paperDownloads._sum.downloads || 0,
      },
      institutesByCategory: institutesByCategory.map(i => ({ name: i.primaryCategory, count: i._count.id })),
      institutesByState: institutesByState.map(i => ({ name: i.state, count: i._count.id })),
      centersByCategory: centersByCategory.map(c => ({ name: c.primaryCategory, count: c._count.id })),
      centersByState: centersByState.map(c => ({ name: c.state, count: c._count.id })),
      centersByMode: centersByMode.map(c => ({ name: c.teachingMode, count: c._count.id })),
      topCenters,
      reviewsByRating: reviewsByRating.map(r => ({ rating: r.rating, count: r._count.id })),
      papersByCategory: papersByCategory.map(p => ({ name: p.examCategory, count: p._count.id })),
      aptitudeByTopic: aptitudeByTopic.map(a => ({ name: a.topic, count: a._count.id })),
      growth: {
        users: groupByDay(recentUsers),
        institutes: groupByDay(recentInstitutes),
        centers: groupByDay(recentCenters),
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Send Notification
export const sendNotification = async (req, res) => {
  try {
    const { title, message, type = "INFO", instituteId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (instituteId) {
      const institute = await prisma.instituteUser.findUnique({ where: { id: instituteId } });
      if (!institute) return res.status(404).json({ error: "Institute not found" });

      const notification = await prisma.notification.create({
        data: { title, message, type, instituteId }
      });
      return res.json({ success: true, message: "Notification sent", notification });
    } else {
      // Broadcast to ALL institutes
      const institutes = await prisma.instituteUser.findMany({
        where: { role: "INSTITUTE" },
        select: { id: true }
      });
      await prisma.notification.createMany({
        data: institutes.map(i => ({ title, message, type, instituteId: i.id }))
      });
      return res.json({ success: true, message: `Notification sent to ${institutes.length} institutes` });
    }
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

// Get All Notifications (admin)
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        institute: { select: { instituteName: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};