// backend/src/routes/auditAgent.routes.js
import express from "express";
import { runAudit, getLastAudit } from "../controllers/auditAgent.controller.js";

const router = express.Router();

// Run full audit manually or via cron
router.post("/run", runAudit);

// Get last audit report
router.get("/last", getLastAudit);

export default router;