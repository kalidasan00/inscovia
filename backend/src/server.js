// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import centersRouter from "./routes/centers.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/centers", centersRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Inscovia API is running" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));