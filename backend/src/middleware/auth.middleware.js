// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

if (JWT_SECRET === "your-secret-key" && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: Using default JWT secret in production!');
}

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    // ✅ ADDED: orgId from token for multi-org support
    req.orgId = decoded.orgId || null;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") return res.status(401).json({ error: "Invalid token" });
    if (error.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired" });
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};