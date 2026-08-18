// backend/src/routes/typing.routes.js
import express from "express";
import { getPassage, submitResult, getLeaderboard } from "../controllers/typing.controller.js";

const router = express.Router();

router.get("/text", getPassage);
router.post("/submit", submitResult);
router.get("/leaderboard", getLeaderboard);

export default router;