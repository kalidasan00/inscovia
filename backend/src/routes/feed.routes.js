// backend/src/routes/feed.routes.js
import express from "express";
import prisma from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPost(post, userId) {
  return {
    id: post.id,
    content: post.content,
    image: post.image,
    pdf: post.pdf ? { url: post.pdf, name: post.pdfName, size: post.pdfSize } : null,
    author: {
      id: post.author.id,
      name: post.author.name,
      initials: post.author.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: post.author.role.toLowerCase(),   // USER → user, INSTITUTE → institute
      sub: post.author.orgMemberships?.[0]?.org?.name ?? "",
      color: roleColor(post.author.role),
    },
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    savesCount: post.savesCount,
    liked: userId ? post.likes.some((l) => l.userId === userId) : false,
    saved: userId ? post.saves.some((s) => s.userId === userId) : false,
    createdAt: post.createdAt,
    time: timeAgo(post.createdAt),
    thread: [],   // loaded separately on comment expand
  };
}

function formatComment(comment, userId) {
  return {
    id: comment.id,
    text: comment.content,
    author: {
      id: comment.author.id,
      name: comment.author.name,
      initials: comment.author.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: comment.author.role.toLowerCase(),
      color: roleColor(comment.author.role),
    },
    likesCount: comment.likesCount,
    liked: userId ? comment.likes.some((l) => l.userId === userId) : false,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    time: timeAgo(comment.createdAt),
    replies: (comment.replies ?? []).map((r) => formatComment(r, userId)),
    moreReplies: 0,
  };
}

function roleColor(role) {
  const map = { ADMIN: "purple", USER: "blue", INSTITUTE: "teal" };
  return map[role] ?? "gray";
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const POST_INCLUDE = (userId) => ({
  author: {
    select: {
      id: true,
      name: true,
      role: true,
      orgMemberships: {
        where: { status: "ACTIVE" },
        take: 1,
        include: { org: { select: { name: true } } },
      },
    },
  },
  likes: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
  saves: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
});

// ─── GET /api/feed — paginated feed ──────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const userId = req.headers.authorization
      ? (() => { try { const jwt = await import("jsonwebtoken"); return jwt.default.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET || "your-secret-key").id; } catch { return null; } })()
      : null;

    const { role, cursor, limit = "15" } = req.query;
    const take = Math.min(parseInt(limit), 30);

    const where = role && role !== "all"
      ? { author: { role: role.toUpperCase() } }
      : {};

    const posts = await prisma.post.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: POST_INCLUDE(userId),
    });

    const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

    res.json({
      posts: posts.map((p) => formatPost(p, userId)),
      nextCursor,
    });
  } catch (error) {
    console.error("❌ GET /feed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// ─── POST /api/feed — create post ────────────────────────────────────────────

router.post("/", authenticate, async (req, res) => {
  try {
    const { content, image, pdf, pdfName, pdfSize } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });
    if (content.length > 500) return res.status(400).json({ error: "Max 500 characters" });

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image: image ?? null,
        pdf: pdf ?? null,
        pdfName: pdfName ?? null,
        pdfSize: pdfSize ?? null,
        authorId: req.userId,
      },
      include: POST_INCLUDE(req.userId),
    });

    res.status(201).json({ post: formatPost(post, req.userId) });
  } catch (error) {
    console.error("❌ POST /feed error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ─── DELETE /api/feed/:id — delete own post ───────────────────────────────────

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.userId) return res.status(403).json({ error: "Not your post" });
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /feed/:id error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ─── PATCH /api/feed/:id/like — toggle like ───────────────────────────────────

router.patch("/:id/like", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { postId_userId: { postId: id, userId } } });
      await prisma.post.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return res.json({ liked: false });
    }

    await prisma.postLike.create({ data: { postId: id, userId } });
    await prisma.post.update({ where: { id }, data: { likesCount: { increment: 1 } } });
    res.json({ liked: true });
  } catch (error) {
    console.error("❌ PATCH /feed/:id/like error:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// ─── PATCH /api/feed/:id/save — toggle save ───────────────────────────────────

router.patch("/:id/save", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.postSave.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    if (existing) {
      await prisma.postSave.delete({ where: { postId_userId: { postId: id, userId } } });
      await prisma.post.update({ where: { id }, data: { savesCount: { decrement: 1 } } });
      return res.json({ saved: false });
    }

    await prisma.postSave.create({ data: { postId: id, userId } });
    await prisma.post.update({ where: { id }, data: { savesCount: { increment: 1 } } });
    res.json({ saved: true });
  } catch (error) {
    console.error("❌ PATCH /feed/:id/save error:", error);
    res.status(500).json({ error: "Failed to toggle save" });
  }
});

// ─── GET /api/feed/:id/comments — load comments for a post ───────────────────

router.get("/:id/comments", async (req, res) => {
  try {
    const userId = req.headers.authorization
      ? (() => { try { const t = req.headers.authorization.split(" ")[1]; const jwt = (await import("jsonwebtoken")).default; return jwt.verify(t, process.env.JWT_SECRET || "your-secret-key").id; } catch { return null; } })()
      : null;

    const comments = await prisma.postComment.findMany({
      where: { postId: req.params.id, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, role: true } },
        likes: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, role: true } },
            likes: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, role: true } },
                likes: userId ? { where: { userId }, select: { userId: true } } : { take: 0, select: { userId: true } },
                replies: { take: 0, include: { author: true, likes: { take: 0, select: { userId: true } } } },
              },
            },
          },
        },
      },
    });

    res.json({ comments: comments.map((c) => formatComment(c, userId)) });
  } catch (error) {
    console.error("❌ GET /feed/:id/comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ─── POST /api/feed/:id/comments — add comment ───────────────────────────────

router.post("/:id/comments", authenticate, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });

    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId: req.params.id,
        authorId: req.userId,
        parentId: parentId ?? null,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
        likes: { take: 0, select: { userId: true } },
        replies: { take: 0, include: { author: true, likes: { take: 0, select: { userId: true } }, replies: { take: 0, include: { author: true, likes: { take: 0, select: { userId: true } }, replies: { take: 0, include: { author: true, likes: { take: 0, select: { userId: true } }, replies: { take: 0, include: { author: true, likes: { take: 0, select: { userId: true } } } } } } } } } },
      },
    });

    // increment commentsCount on post
    await prisma.post.update({
      where: { id: req.params.id },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json({ comment: formatComment(comment, req.userId) });
  } catch (error) {
    console.error("❌ POST /feed/:id/comments error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ─── PATCH /api/feed/comments/:id/like — toggle comment like ─────────────────

router.patch("/comments/:id/like", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.postCommentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    if (existing) {
      await prisma.postCommentLike.delete({ where: { commentId_userId: { commentId: id, userId } } });
      await prisma.postComment.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return res.json({ liked: false });
    }

    await prisma.postCommentLike.create({ data: { commentId: id, userId } });
    await prisma.postComment.update({ where: { id }, data: { likesCount: { increment: 1 } } });
    res.json({ liked: true });
  } catch (error) {
    console.error("❌ PATCH /feed/comments/:id/like error:", error);
    res.status(500).json({ error: "Failed to toggle comment like" });
  }
});

export default router;