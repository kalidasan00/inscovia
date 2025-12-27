// backend/src/controllers/admin.controller.js
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find admin user
    const admin = await prisma.instituteUser.findUnique({
      where: { email }
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: "Admin account is deactivated" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.instituteName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
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
      recentCenters
    ] = await Promise.all([
      prisma.center.count(),
      prisma.instituteUser.count({ where: { role: "INSTITUTE" } }),
      prisma.instituteUser.count({
        where: { role: "INSTITUTE", isVerified: false }
      }),
      prisma.instituteUser.count({
        where: { role: "INSTITUTE", isActive: true }
      }),
      prisma.user.count(),
      prisma.center.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              instituteName: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalCenters,
        totalInstitutes,
        pendingInstitutes,
        activeInstitutes,
        totalUsers
      },
      recentCenters
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// Get All Institutes
export const getAllInstitutes = async (req, res) => {
  try {
    const { status } = req.query;

    let where = { role: "INSTITUTE" };

    if (status === "pending") {
      where.isVerified = false;
    } else if (status === "active") {
      where.isActive = true;
      where.isVerified = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const institutes = await prisma.instituteUser.findMany({
      where,
      include: {
        centers: {
          select: {
            id: true,
            name: true,
            type: true,
            rating: true
          }
        }
      },
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
      data: {
        isVerified: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: "Institute approved successfully",
      institute
    });
  } catch (error) {
    console.error("Approve institute error:", error);
    res.status(500).json({ error: "Failed to approve institute" });
  }
};

// Reject/Delete Institute
export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;

    // This will also delete associated centers due to cascade
    await prisma.instituteUser.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Institute deleted successfully"
    });
  } catch (error) {
    console.error("Delete institute error:", error);
    res.status(500).json({ error: "Failed to delete institute" });
  }
};

// Toggle Institute Active Status
export const toggleInstituteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const institute = await prisma.instituteUser.findUnique({
      where: { id }
    });

    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

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
          select: {
            instituteName: true,
            email: true,
            phone: true,
            isVerified: true,
            isActive: true
          }
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

    await prisma.center.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Center deleted successfully"
    });
  } catch (error) {
    console.error("Delete center error:", error);
    res.status(500).json({ error: "Failed to delete center" });
  }
};