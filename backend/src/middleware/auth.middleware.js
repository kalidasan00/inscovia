// backend/src/middleware/auth.middleware.js - OPTIMIZED
import jwt from "jsonwebtoken";

// ✅ OPTIMIZED: Cache JWT secret (read env once, not on every request)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Warn if using default secret in production
if (JWT_SECRET === "your-secret-key" && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: Using default JWT secret in production! Set JWT_SECRET in environment.');
}

export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // ✅ OPTIMIZED: Verify token with cached secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user data to request
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    // ✅ OPTIMIZED: Specific error messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    // Log unexpected errors for debugging
    console.error('❌ Auth middleware error:', error);

    return res.status(500).json({ error: "Authentication failed" });
  }
};