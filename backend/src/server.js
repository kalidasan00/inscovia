// backend/src/server.js - OPTIMIZED VERSION WITH SEO + AI FEATURES
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
import passwordResetRouter from "./routes/password-reset.routes.js";
import papersRouter from "./routes/papers.routes.js";
import sitemapRoutes from './routes/sitemap.routes.js';
import chatRouter from "./routes/chat.routes.js";
import searchRouter from "./routes/search.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import reviewIntelligenceRouter from "./routes/reviewIntelligence.routes.js";
import auditAgentRouter from "./routes/auditAgent.routes.js";
import { registerSlugMiddleware } from './middleware/slugMiddleware.js';
import aptitudeRouter from "./routes/aptitude.routes.js";
import { runAudit } from "./controllers/auditAgent.controller.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

registerSlugMiddleware(prisma);
console.log('✅ Slug middleware registered');

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

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many reviews submitted, please try again later.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

app.use('/api/reviews', (req, res, next) => {
  if (req.method === 'POST') return reviewLimiter(req, res, next);
  next();
});

// ✅ SEO Routes - MUST BE BEFORE OTHER ROUTES
app.use('/', sitemapRoutes);

// API Routes
app.use("/api/centers", centersRouter);
app.use("/api/auth", passwordResetRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/papers", papersRouter);
app.use("/api/chat", chatRouter);
app.use("/api/search", searchRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/review-intelligence", reviewIntelligenceRouter);
app.use("/api/audit", auditAgentRouter);
app.use("/api/aptitude", aptitudeRouter);

app.get("/", (req, res) => {
  res.json({ message: "Inscovia API is running ✅" });
});

app.get("/api/keep-alive", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
const BACKEND_URL = process.env.BACKEND_URL || `https://inscovia.onrender.com`;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🔒 Rate limiting enabled for auth routes only`);
  console.log(`🗺️  Sitemap available at: ${BACKEND_URL}/sitemap.xml`);
  console.log(`🤖 Robots.txt available at: ${BACKEND_URL}/robots.txt`);
  console.log(`💬 AI Chat available at: ${BACKEND_URL}/api/chat`);
  console.log(`🔍 AI Search available at: ${BACKEND_URL}/api/search`);
  console.log(`📊 Analytics available at: ${BACKEND_URL}/api/analytics`);
  console.log(`🧠 Review Intelligence at: ${BACKEND_URL}/api/review-intelligence`);
  console.log(`🕵️  Audit Agent at: ${BACKEND_URL}/api/audit`);
  console.log(`🧠 Aptitude API available at: ${BACKEND_URL}/api/aptitude`);

  if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend API configured');
  } else {
    console.warn('⚠️  RESEND_API_KEY not configured - email sending will fail');
  }

  if (process.env.GROQ_API_KEY) {
    console.log('✅ Groq AI configured and ready');
  } else {
    console.warn('⚠️  GROQ_API_KEY not configured - AI features will fail');
  }

  if (process.env.ADMIN_EMAIL) {
    console.log(`✅ Admin email configured: ${process.env.ADMIN_EMAIL}`);
  } else {
    console.warn('⚠️  ADMIN_EMAIL not configured - audit emails will not send');
  }

  // ✅ Keep-alive ping every 14 minutes
  setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/keep-alive`);
      const data = await response.json();
      console.log('✅ Keep-alive ping:', data.status, data.timestamp);
    } catch (error) {
      console.error('❌ Keep-alive failed:', error.message);
    }
  }, 14 * 60 * 1000);

  // ✅ Weekly audit — runs every 7 days automatically
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  setInterval(async () => {
    console.log("🤖 Running scheduled weekly audit...");
    try {
      const fakeReq = {};
      const fakeRes = {
        json: (data) => console.log("✅ Weekly audit complete:", data.summary),
        status: () => ({ json: (e) => console.error("❌ Audit error:", e) })
      };
      await runAudit(fakeReq, fakeRes);
    } catch (err) {
      console.error("❌ Weekly audit failed:", err.message);
    }
  }, SEVEN_DAYS);

  console.log('🕵️  Weekly audit scheduled — runs every 7 days');
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing server gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});