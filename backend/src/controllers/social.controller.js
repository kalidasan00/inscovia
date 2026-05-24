// backend/src/controllers/social.controller.js
import prisma from "../lib/prisma.js";

export const getUsers = async (req, res) => {
  try {
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
      role:     { not: "ADMIN" }, // ✅ exclude admin accounts
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(role && role !== "all" ? { role: role.toUpperCase() } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      take:    50,
      orderBy: { createdAt: "desc" },
      select: {
        id:       true,
        name:     true,
        username: true,
        avatar:   true,
        role:     true,
        orgMemberships: {
          where:  { status: "ACTIVE" },
          take:   1,
          select: { org: { select: { name: true } } },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { followerId: true } }
          : false,
      },
    });

    const formatted = users.map(u => ({
      id:          u.id,
      name:        u.name,
      username:    u.username || null,
      avatar:      u.avatar   || null,
      role:        u.role.toLowerCase(),
      orgName:     u.orgMemberships?.[0]?.org?.name || null,
      isFollowing: currentUserId ? (u.followers?.length > 0) : false,
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

export const getUserProfile = async (req, res) => {
  try {
    let currentUserId = null;
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const jwt     = (await import("jsonwebtoken")).default;
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "your-secret-key");
        currentUserId = decoded.id;
      } catch {}
    }

    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id:        true,
        name:      true,
        username:  true,
        avatar:    true,
        role:      true,
        createdAt: true,
        orgMemberships: {
          where:  { status: "ACTIVE" },
          take:   1,
          select: { org: { select: { name: true, slug: true } } },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts:     true,
          },
        },
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { followerId: true } }
          : false,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id:             user.id,
        name:           user.name,
        username:       user.username,
        avatar:         user.avatar || null,
        role:           user.role.toLowerCase(),
        orgName:        user.orgMemberships?.[0]?.org?.name || null,
        orgSlug:        user.orgMemberships?.[0]?.org?.slug || null,
        joinedAt:       user.createdAt,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount:     user._count.posts,
        isFollowing:    currentUserId ? (user.followers?.length > 0) : false,
        isMe:           currentUserId === user.id,
      },
    });
  } catch (error) {
    console.error("❌ getUserProfile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where:  { username },
      select: { id: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await prisma.post.findMany({
      where:   { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take:    20,
      select: {
        id:            true,
        content:       true,
        image:         true,
        likesCount:    true,
        commentsCount: true,
        savesCount:    true,
        createdAt:     true,
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error("❌ getUserPosts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};