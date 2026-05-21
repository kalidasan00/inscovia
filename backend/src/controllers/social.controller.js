// backend/src/controllers/social.controller.js
import prisma from "../lib/prisma.js";

export const getUsers = async (req, res) => {
  try {
    // get current userId from token if present
    let currentUserId = null;
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const jwt     = (await import("jsonwebtoken")).default;
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "your-secret-key");
        currentUserId = decoded.id;
      } catch {}
    }

    const { q, role } = req.query;

    const where = {
      isActive: true,
      ...(q    ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(role && role !== "all" ? { role: role.toUpperCase() } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id:     true,
        name:   true,
        avatar: true,
        role:   true,
        orgMemberships: {
          where:  { status: "ACTIVE" },
          take:   1,
          select: { org: { select: { name: true } } },
        },
        // get follow status for current user
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { followerId: true } }
          : false,
      },
    });

    const formatted = users.map(u => ({
      id:          u.id,
      name:        u.name,
      avatar:      u.avatar || null,
      role:        u.role.toLowerCase(),
      orgName:     u.orgMemberships?.[0]?.org?.name || null,
      isFollowing: currentUserId
        ? (u.followers?.length > 0)
        : false,
    }));

    res.json({ users: formatted });
  } catch (error) {
    console.error("❌ getUsers error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const followUser = async (req, res) => {
  try {
    const followerId  = req.userId;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    await prisma.follow.upsert({
      where:  { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });

    res.json({ following: true });
  } catch (error) {
    console.error("❌ followUser error:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const followerId  = req.userId;
    const followingId = req.params.userId;

    await prisma.follow.deleteMany({
      where: { followerId, followingId },
    });

    res.json({ following: false });
  } catch (error) {
    console.error("❌ unfollowUser error:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};