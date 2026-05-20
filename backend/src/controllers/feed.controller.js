// backend/src/controllers/feed.controller.js
import prisma from "../lib/prisma.js";

function formatPost(post, userId) {
  const name = post.author.name;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const role = post.author.role?.toLowerCase() === "admin" ? "admin"
    : post.author.orgMemberships?.length > 0 ? "institute" : "student";

  const colors = ["purple", "teal", "blue", "coral", "amber", "green"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return {
    id: post.id,
    content: post.content,
    image: post.image || null,
    pdf: post.pdf ? { url: post.pdf, name: post.pdfName, size: post.pdfSize } : null,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    savesCount: post.savesCount,
    liked: userId ? post.likes.some(l => l.userId === userId) : false,
    saved: userId ? post.saves.some(s => s.userId === userId) : false,
    time: timeAgo(post.createdAt),
    author: {
      name,
      initials,
      role,
      color,
      sub: post.author.orgMemberships?.[0]?.org?.city || null,
    },
  };
}

function formatComment(comment, userId) {
  const name = comment.author.name;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["purple", "teal", "blue", "coral", "amber", "green"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const role = comment.author.orgMemberships?.length > 0 ? "institute" : "student";

  return {
    id: comment.id,
    text: comment.content,
    likesCount: comment.likesCount,
    liked: userId ? comment.likes.some(l => l.userId === userId) : false,
    time: timeAgo(comment.createdAt),
    author: { name, initials, color, role },
    replies: (comment.replies || []).map(r => formatComment(r, userId)),
  };
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const POST_INCLUDE = {
  author: {
    select: {
      id: true, name: true, role: true,
      orgMemberships: { select: { org: { select: { city: true } } }, take: 1 }
    }
  },
  likes: { select: { userId: true } },
  saves: { select: { userId: true } },
};

const COMMENT_INCLUDE = {
  author: {
    select: {
      id: true, name: true, role: true,
      orgMemberships: { select: { org: { select: { city: true } } }, take: 1 }
    }
  },
  likes: { select: { userId: true } },
  replies: {
    include: {
      author: {
        select: {
          id: true, name: true, role: true,
          orgMemberships: { select: { org: { select: { city: true } } }, take: 1 }
        }
      },
      likes: { select: { userId: true } },
      replies: { include: { author: { select: { id: true, name: true, role: true, orgMemberships: { select: { org: { select: { city: true } } }, take: 1 } } }, likes: { select: { userId: true } } } }
    },
    orderBy: { createdAt: "asc" }
  }
};

export const getFeed = async (req, res) => {
  try {
    const userId = req.userId || null;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip, take: limit,
    });

    res.json({ posts: posts.map(p => formatPost(p, userId)) });
  } catch (error) {
    console.error("❌ getFeed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image, pdf, pdfName, pdfSize } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });
    if (content.length > 500) return res.status(400).json({ error: "Max 500 characters" });

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        image: image || null,
        pdf: pdf || null,
        pdfName: pdfName || null,
        pdfSize: pdfSize || null,
        authorId: req.userId,
      },
      include: POST_INCLUDE,
    });

    res.status(201).json({ post: formatPost(post, req.userId) });
  } catch (error) {
    console.error("❌ createPost error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId } }
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
    console.error("❌ toggleLike error:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

export const toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await prisma.postSave.findUnique({
      where: { postId_userId: { postId: id, userId } }
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
    console.error("❌ toggleSave error:", error);
    res.status(500).json({ error: "Failed to toggle save" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || null;

    const comments = await prisma.postComment.findMany({
      where: { postId: id, parentId: null },
      include: COMMENT_INCLUDE,
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments: comments.map(c => formatComment(c, userId)) });
  } catch (error) {
    console.error("❌ getComments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        postId: id,
        authorId: req.userId,
        parentId: parentId || null,
      },
      include: COMMENT_INCLUDE,
    });

    await prisma.post.update({ where: { id }, data: { commentsCount: { increment: 1 } } });

    res.status(201).json({ comment: formatComment(comment, req.userId) });
  } catch (error) {
    console.error("❌ addComment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const existing = await prisma.postCommentLike.findUnique({
      where: { commentId_userId: { commentId, userId } }
    });

    if (existing) {
      await prisma.postCommentLike.delete({ where: { commentId_userId: { commentId, userId } } });
      await prisma.postComment.update({ where: { id: commentId }, data: { likesCount: { decrement: 1 } } });
      return res.json({ liked: false });
    }

    await prisma.postCommentLike.create({ data: { commentId, userId } });
    await prisma.postComment.update({ where: { id: commentId }, data: { likesCount: { increment: 1 } } });
    res.json({ liked: true });
  } catch (error) {
    console.error("❌ toggleCommentLike error:", error);
    res.status(500).json({ error: "Failed to toggle comment like" });
  }
};