// backend/src/routes/reviewIntelligence.routes.js
import express from "express";
import { getReviewIntelligence, getReviewSummary } from "../controllers/reviewIntelligence.controller.js";

const router = express.Router();

// Full analysis — for institute dashboard (admin/institute only)
router.get("/:centerId", getReviewIntelligence);

// Lightweight summary — for public center pages
router.get("/summary/:centerId", getReviewSummary);

export default router;