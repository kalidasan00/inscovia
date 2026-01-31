// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { PrismaClient } from '@prisma/client';
import net from 'net';
import centersRouter from "./routes/centers.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import reviewsRouter from "./routes/reviews.routes.js";
import passwordResetRouter from "./routes/password-reset.routes.js";
import { registerSlugMiddleware } from './middleware/slugMiddleware.js';

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
  if (req.method === 'POST') {
    return reviewLimiter(req, res, next);
  }
  next();
});

// Routes
app.use("/api/centers", centersRouter);
app.use("/api/auth", passwordResetRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.json({ message: "Inscovia API is running" });
});

app.get("/api/keep-alive", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", message: "Database is awake" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ZeptoMail SMTP Port Test
const testSMTP = () => {
  console.log('🔍 Testing ZeptoMail SMTP connectivity...');

  const client = net.connect({ host: 'smtp.zeptomail.in', port: 587 }, () => {
    console.log('✅ Port 587 is OPEN - ZeptoMail is reachable');
    client.end();
  });

  client.on('error', (err) => {
    console.log('❌ ZeptoMail Port 587 ERROR:', err.message);
  });

  client.setTimeout(5000);
  client.on('timeout', () => {
    console.log('❌ ZeptoMail Port 587 TIMEOUT');
    client.destroy();
  });
};

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🔒 Rate limiting enabled for auth routes only`);

  // Test SMTP after 3 seconds
  setTimeout(testSMTP, 3000);

  // Keep-alive pinger
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database keep-alive ping:', new Date().toISOString());
    } catch (error) {
      console.error('❌ Keep-alive failed:', error.message);
    }
  }, 10 * 60 * 1000);
});