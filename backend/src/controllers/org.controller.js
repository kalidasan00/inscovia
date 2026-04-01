// backend/src/controllers/org.controller.js
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendInviteEmail } from "../utils/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const INVITE_EXPIRY_DAYS = 7;

// ─── GET MY ORGANIZATIONS ─────────────────────────────────────────────────────

export const getMyOrgs = async (req, res) => {
  try {
    const memberships = await prisma.orgMember.findMany({
      where: { userId: req.userId, status: "ACTIVE" },
      include: {
        org: {
          select: {
            id: true, name: true, slug: true,
            primaryCategory: true, city: true, state: true,
            centers: {
              select: { id: true, slug: true, name: true, image: true, logo: true }
            }
          }
        }
      }
    });

    res.json({
      organizations: memberships.map(m => ({
        ...m.org,
        role: m.role,
        membershipId: m.id,
      }))
    });
  } catch (error) {
    console.error("❌ getMyOrgs error:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
};

// ─── SWITCH ACTIVE ORG ───────────────────────────────────────────────────────

export const switchOrg = async (req, res) => {
  try {
    const { orgId } = req.body;
    if (!orgId) return res.status(400).json({ error: "orgId is required" });

    // ✅ Verify user is member of requested org
    const membership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } },
      include: {
        org: {
          include: {
            centers: {
              select: {
                id: true, slug: true, name: true,
                image: true, logo: true, rating: true,
                city: true, state: true,
                primaryCategory: true, secondaryCategories: true,
                teachingMode: true, district: true, location: true,
                latitude: true, longitude: true,
                description: true, courses: true, courseDetails: true,
                gallery: true, website: true, whatsapp: true,
                phone: true, email: true, facebook: true,
                instagram: true, linkedin: true, countries: true,
                services: true, topUniversities: true,
                avgScholarship: true, successRate: true, studentsPlaced: true,
              }
            }
          }
        }
      }
    });

    if (!membership || membership.status !== "ACTIVE") {
      return res.status(403).json({ error: "You are not a member of this organization" });
    }

    // ✅ Issue new token with new orgId
    const newToken = jwt.sign(
      { id: req.userId, email: req.userEmail, orgId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const org = membership.org;
    const center = org.centers?.[0] || null;

    res.json({
      success: true,
      token: newToken,
      organization: {
        id: org.id, name: org.name, slug: org.slug,
        primaryCategory: org.primaryCategory,
        secondaryCategories: org.secondaryCategories,
        teachingMode: org.teachingMode,
        state: org.state, district: org.district,
        city: org.city, location: org.location,
      },
      center,
      role: membership.role,
    });
  } catch (error) {
    console.error("❌ switchOrg error:", error);
    res.status(500).json({ error: "Failed to switch organization" });
  }
};

// ─── GET ORG MEMBERS ─────────────────────────────────────────────────────────

export const getOrgMembers = async (req, res) => {
  try {
    const { orgId } = req.params;

    // ✅ Verify requester is member of this org
    const requesterMembership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } }
    });
    if (!requesterMembership || requesterMembership.status !== "ACTIVE") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const members = await prisma.orgMember.findMany({
      where: { orgId, status: { in: ["ACTIVE", "INVITED"] } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    // Also get pending invites
    const invites = await prisma.orgInvite.findMany({
      where: { orgId, status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      members: members.map(m => ({
        id: m.id,
        role: m.role,
        status: m.status,
        joinedAt: m.createdAt,
        user: m.user,
      })),
      pendingInvites: invites.map(i => ({
        id: i.id,
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ getOrgMembers error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

// ─── INVITE MEMBER ───────────────────────────────────────────────────────────

export const inviteMember = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email, role = "STAFF" } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!["MANAGER", "STAFF"].includes(role)) {
      return res.status(400).json({ error: "Role must be MANAGER or STAFF" });
    }

    // ✅ Only OWNER or MANAGER can invite
    const requesterMembership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } }
    });
    if (!requesterMembership || requesterMembership.status !== "ACTIVE") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!["OWNER", "MANAGER"].includes(requesterMembership.role)) {
      return res.status(403).json({ error: "Only OWNER or MANAGER can invite members" });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    });
    if (!org) return res.status(404).json({ error: "Organization not found" });

    // ✅ Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: { userId_orgId: { userId: existingUser.id, orgId } }
      });
      if (existingMember && existingMember.status === "ACTIVE") {
        return res.status(400).json({ error: "This person is already a member" });
      }
    }

    // ✅ Cancel any existing pending invite for this email+org
    await prisma.orgInvite.updateMany({
      where: { orgId, email, status: "PENDING" },
      data: { status: "CANCELLED" }
    });

    // ✅ Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await prisma.orgInvite.create({
      data: { email, role, token, orgId, expiresAt, status: "PENDING" }
    });

    // ✅ Build invite link
    const inviteLink = `${process.env.FRONTEND_URL || "https://inscovia.com"}/invite?token=${token}`;

    // ✅ Send email
    try {
      await sendInviteEmail(email, org.name, role, inviteLink);
    } catch (emailErr) {
      console.error("❌ Failed to send invite email:", emailErr.message);
      // Don't fail the request — link still works
    }

    console.log(`✅ Invite sent: ${email} → ${org.name} as ${role}`);
    res.json({
      success: true,
      message: `Invite sent to ${email}`,
      inviteLink, // ✅ Return link so owner can also share via WhatsApp
      invite: { id: invite.id, email, role, expiresAt }
    });
  } catch (error) {
    console.error("❌ inviteMember error:", error);
    res.status(500).json({ error: "Failed to send invite" });
  }
};

// ─── GET INVITE INFO (for invite page) ───────────────────────────────────────

export const getInviteInfo = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await prisma.orgInvite.findUnique({
      where: { token },
      include: {
        org: { select: { id: true, name: true, city: true, primaryCategory: true } }
      }
    });

    if (!invite) return res.status(404).json({ error: "Invite not found or invalid" });
    if (invite.status !== "PENDING") return res.status(400).json({ error: "Invite already used or cancelled" });
    if (new Date() > invite.expiresAt) {
      await prisma.orgInvite.update({ where: { token }, data: { status: "EXPIRED" } });
      return res.status(400).json({ error: "Invite has expired" });
    }

    // ✅ Check if invited email already has an account
    const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });

    res.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        org: invite.org,
      },
      hasAccount: !!existingUser,
    });
  } catch (error) {
    console.error("❌ getInviteInfo error:", error);
    res.status(500).json({ error: "Failed to get invite info" });
  }
};

// ─── ACCEPT INVITE ───────────────────────────────────────────────────────────

export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const invite = await prisma.orgInvite.findUnique({
      where: { token },
      include: { org: true }
    });

    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.status !== "PENDING") return res.status(400).json({ error: "Invite already used or cancelled" });
    if (new Date() > invite.expiresAt) {
      await prisma.orgInvite.update({ where: { token }, data: { status: "EXPIRED" } });
      return res.status(400).json({ error: "Invite has expired" });
    }

    // ✅ Verify logged-in user matches invite email
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.email !== invite.email) {
      return res.status(403).json({ error: `This invite was sent to ${invite.email}` });
    }

    // ✅ Add as org member
    await prisma.$transaction(async (tx) => {
      // Upsert — in case membership exists but was suspended
      await tx.orgMember.upsert({
        where: { userId_orgId: { userId: user.id, orgId: invite.orgId } },
        create: { userId: user.id, orgId: invite.orgId, role: invite.role, status: "ACTIVE" },
        update: { role: invite.role, status: "ACTIVE" }
      });
      await tx.orgInvite.update({ where: { token }, data: { status: "ACCEPTED" } });
    });

    // ✅ Issue new token with this org active
    const newToken = jwt.sign(
      { id: user.id, email: user.email, orgId: invite.orgId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ Invite accepted: ${user.email} → ${invite.org.name} as ${invite.role}`);
    res.json({
      success: true,
      message: `You've joined ${invite.org.name} as ${invite.role}!`,
      token: newToken,
      orgId: invite.orgId,
      orgName: invite.org.name,
      role: invite.role,
    });
  } catch (error) {
    console.error("❌ acceptInvite error:", error);
    res.status(500).json({ error: "Failed to accept invite" });
  }
};

// ─── CANCEL INVITE ────────────────────────────────────────────────────────────

export const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;

    const invite = await prisma.orgInvite.findUnique({ where: { id: inviteId } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    // ✅ Only OWNER/MANAGER of that org can cancel
    const membership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId: invite.orgId } }
    });
    if (!membership || !["OWNER", "MANAGER"].includes(membership.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.orgInvite.update({ where: { id: inviteId }, data: { status: "CANCELLED" } });
    res.json({ success: true, message: "Invite cancelled" });
  } catch (error) {
    console.error("❌ cancelInvite error:", error);
    res.status(500).json({ error: "Failed to cancel invite" });
  }
};

// ─── REMOVE MEMBER ────────────────────────────────────────────────────────────

export const removeMember = async (req, res) => {
  try {
    const { orgId, memberId } = req.params;

    // ✅ Only OWNER can remove members
    const requesterMembership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } }
    });
    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return res.status(403).json({ error: "Only OWNER can remove members" });
    }

    const targetMember = await prisma.orgMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.orgId !== orgId) {
      return res.status(404).json({ error: "Member not found" });
    }

    // ✅ Can't remove yourself (owner)
    if (targetMember.userId === req.userId) {
      return res.status(400).json({ error: "You cannot remove yourself" });
    }

    await prisma.orgMember.update({
      where: { id: memberId },
      data: { status: "SUSPENDED" }
    });

    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("❌ removeMember error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// ─── UPDATE MEMBER ROLE ───────────────────────────────────────────────────────

export const updateMemberRole = async (req, res) => {
  try {
    const { orgId, memberId } = req.params;
    const { role } = req.body;

    if (!["MANAGER", "STAFF"].includes(role)) {
      return res.status(400).json({ error: "Role must be MANAGER or STAFF" });
    }

    // ✅ Only OWNER can change roles
    const requesterMembership = await prisma.orgMember.findUnique({
      where: { userId_orgId: { userId: req.userId, orgId } }
    });
    if (!requesterMembership || requesterMembership.role !== "OWNER") {
      return res.status(403).json({ error: "Only OWNER can change roles" });
    }

    const targetMember = await prisma.orgMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.orgId !== orgId) {
      return res.status(404).json({ error: "Member not found" });
    }
    if (targetMember.userId === req.userId) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    await prisma.orgMember.update({ where: { id: memberId }, data: { role } });
    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    console.error("❌ updateMemberRole error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};