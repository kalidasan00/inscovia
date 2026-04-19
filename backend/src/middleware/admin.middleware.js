// backend/src/middleware/admin.middleware.js
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// ✅ Permission map — which routes require which permission
const ROUTE_PERMISSIONS = {
  "/api/admin/dashboard/stats":   "dashboard:read",
  "/api/admin/analytics":         "analytics:read",
  "/api/admin/institutes":        "institutes:read",
  "/api/admin/centers":           "centers:read",
  "/api/admin/users":             "users:read",
  "/api/admin/notifications":     "notifications:read",
  "/api/admin/papers":            "papers:read",
  "/api/admin/aptitude":          "aptitude:read",
  "/api/admin/blog":              "blog:read",
  "/api/admin/study-abroad":      "study-abroad:read",
  "/api/admin/banners":           "banners:read",
};

const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// ✅ Resolve required permission from request
function getRequiredPermission(path, method) {
  // Find matching base route
  const base = Object.keys(ROUTE_PERMISSIONS).find(r => path.startsWith(r));
  if (!base) return null;
  const resource = ROUTE_PERMISSIONS[base].split(":")[0];
  const action = WRITE_METHODS.includes(method) ? "write" : "read";
  return `${resource}:${action}`;
}

export const adminOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // ✅ Now reads from User table (not InstituteUser)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        adminRole: true,
        permissions: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Admin account is deactivated" });
    }

    // ✅ SUPER_ADMIN bypasses all permission checks
    if (user.adminRole === "SUPER_ADMIN") {
      req.userId = user.id;
      req.userRole = user.role;
      req.adminRole = user.adminRole;
      req.permissions = ["*"];
      return next();
    }

    // ✅ ADMIN — check permission for this route + method
    const required = getRequiredPermission(req.path, req.method);

    if (required) {
      const hasPermission = user.permissions.includes(required) ||
        // write implies read for same resource
        (required.endsWith(":read") &&
          user.permissions.includes(required.replace(":read", ":write")));

      if (!hasPermission) {
        return res.status(403).json({
          error: "Access denied",
          required,
          yourPermissions: user.permissions,
        });
      }
    }

    req.userId = user.id;
    req.userRole = user.role;
    req.adminRole = user.adminRole;
    req.permissions = user.permissions;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// ✅ Specific permission check — use inside individual route handlers
// e.g. requirePermission("papers:write")
export const requirePermission = (permission) => (req, res, next) => {
  if (req.adminRole === "SUPER_ADMIN" || req.permissions?.includes("*")) {
    return next();
  }
  if (!req.permissions?.includes(permission)) {
    return res.status(403).json({
      error: "Access denied",
      required: permission,
      yourPermissions: req.permissions,
    });
  }
  next();
};