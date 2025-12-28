// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { PrismaClient } from '@prisma/client';
import centersRouter from "./routes/centers.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import reviewsRouter from "./routes/reviews.routes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// CORS Configuration
app.use(cors({
  origin: [
    'https://www.inscovia.com',
    'https://inscovia.com',
    'https://inscovia-qopq.vercel.app',
    'https://inscovia.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ===== RATE LIMITING =====

// General API rate limit - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth routes - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Review submission limit - 10 per hour
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many reviews submitted, please try again later.' },
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// Apply strict limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply review limiting
app.use('/api/reviews', reviewLimiter);

// Routes
app.use("/api/centers", centersRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Inscovia API is running" });
});

// Database keep-alive endpoint
app.get("/api/keep-alive", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", message: "Database is awake" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🔒 Rate limiting enabled`);

  // Start keep-alive pinger
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database keep-alive ping:', new Date().toISOString());
    } catch (error) {
      console.error('❌ Keep-alive failed:', error.message);
    }
  }, 10 * 60 * 1000); // Every 10 minutes
});