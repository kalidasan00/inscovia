// backend/src/routes/org.routes.js
import express from "express";
import {
  getMyOrgs,
  switchOrg,
  getOrgMembers,
  inviteMember,
  getInviteInfo,
  acceptInvite,
  cancelInvite,
  removeMember,
  updateMemberRole,
} from "../controllers/org.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// ── My orgs ──────────────────────────────────────────────────────────────────
router.get("/my", authenticate, getMyOrgs);
router.post("/switch", authenticate, switchOrg);

// ── Members ──────────────────────────────────────────────────────────────────
router.get("/:orgId/members", authenticate, getOrgMembers);
router.post("/:orgId/invite", authenticate, inviteMember);
router.delete("/:orgId/members/:memberId", authenticate, removeMember);
router.put("/:orgId/members/:memberId/role", authenticate, updateMemberRole);

// ── Invite (public — no auth needed to view invite info) ─────────────────────
router.get("/invite/:token", getInviteInfo);
router.post("/invite/:token/accept", authenticate, acceptInvite);
router.delete("/invites/:inviteId", authenticate, cancelInvite);

export default router;