// backend/src/routes/analytics.routes.js
import express from "express";
import { logSearch, logView, getTrending, getTrendingByCity } from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/log-search", logSearch);
router.post("/log-view", logView);
router.get("/trending", getTrending);
router.get("/trending/city/:city", getTrendingByCity);

export default router;