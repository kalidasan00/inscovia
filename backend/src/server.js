// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import centersRouter from "./routes/centers.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import reviewsRouter from "./routes/reviews.routes.js";  // ← ADD THIS

dotenv.config();

const app = express();

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

// Routes
app.use("/api/centers", centersRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewsRouter);  // ← ADD THIS

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Inscovia API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});