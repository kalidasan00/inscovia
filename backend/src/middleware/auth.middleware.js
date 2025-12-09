// backend/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Add user id to request
    req.userId = decoded.id;
    req.userEmail = decoded.email;

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