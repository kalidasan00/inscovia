// backend/src/routes/college.routes.js
import express from "express";
import { getColleges, getCollegeBySlug, updateCollege } from "../controllers/college.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getColleges);
router.get("/:slug", getCollegeBySlug);
router.put("/:slug", authenticate, updateCollege);

export default router;