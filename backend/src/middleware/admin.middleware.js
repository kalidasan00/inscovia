// backend/src/middleware/admin.middleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const adminOnly = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Get user from database
    const user = await prisma.instituteUser.findUnique({
      where: { id: decoded.id }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Check if admin account is active
    if (!user.isActive) {
      return res.status(403).json({ error: "Admin account is deactivated" });
    }

    // Attach user info to request
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};