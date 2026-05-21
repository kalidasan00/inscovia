// backend/src/controllers/feed.controller.js
import prisma from "../lib/prisma.js";
import cloudinary from "../config/cloudinary.js";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function roleColor(role) {
  const map = { ADMIN: "purple", USER: "blue", INSTITUTE: "teal" };
  return map[role] ?? "gray";
}

function formatPost(post, userId) {
  return {
    id:      post.id,
    content: post.content,
    image:   post.image ?? null,
    pdf:     post.pdf
      ? { url: post.pdf, name: post.pdfName, size: post.pdfSize }
      : null,
    author: {
      id:       post.author.id,
      name:     post.author.name,
      initials: getInitials(post.author.name),
      role:     post.author.role.toLowerCase(),
      sub:      post.author.orgMemberships?.[0]?.org?.name ?? "",
      color:    roleColor(post.author.role),
      avatar:   post.author.avatar || null,
    },
    likesCount:    post.likesCount,
    commentsCount: post.commentsCount,
    savesCount:    post.savesCount,
    liked: userId ? post.likes.some((l) => l.userId === userId) : false,
    saved: userId ? post.saves.some((s) => s.userId === userId) : false,
    time:      timeAgo(post.createdAt),
    createdAt: post.createdAt,
  };
}

function formatComment(comment, userId) {
  return {
    id:   comment.id,
    text: comment.content,
    author: {
      id:       comment.author.id,
      name:     comment.author.name,
      initials: getInitials(comment.author.name),
      role:     comment.author.role.toLowerCase(),
      color:    roleColor(comment.author.role),
      avatar:   comment.author.avatar || null,
    },
    likesCount: comment.likesCount,
    liked:      userId ? comment.likes.some((l) => l.userId === userId) : false,
    parentId:   comment.parentId ?? null,
    time:       timeAgo(comment.createdAt),
    createdAt:  comment.createdAt,
    replies:    (comment.replies ?? []).map((r) => formatComment(r, userId)),
    moreReplies: 0,
  };
}

function postInclude(userId) {
  return {
    author: {
      select: {
        id: true, name: true, role: true, avatar: true,
        orgMemberships: {
          where:  { status: "ACTIVE" },
          take:   1,
          select: { org: { select: { name: true } } },
        },
      },
    },
    likes: {
      where:  userId ? { userId } : { userId: "___none___" },
      select: { userId: true },
    },
    saves: {
      where:  userId ? { userId } : { userId: "___none___" },
      select: { userId: true },
    },
  };
}

function commentInclude(userId) {
  const likeWhere   = userId ? { userId } : { userId: "___none___" };
  const authorSelect = { id: true, name: true, role: true, avatar: true };

  return {
    author: { select: authorSelect },
    likes:  { where: likeWhere, select: { userId: true } },
    replies: {
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: authorSelect },
        likes:  { where: likeWhere, select: { userId: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: authorSelect },
            likes:  { where: likeWhere, select: { userId: true } },
            replies: { take: 0, include: { author: { select: authorSelect }, likes: { take: 0, select: { userId: true } } } },
          },
        },
      },
    },
  };
}

export async function getFeed(req, res) {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const { default: jwt } = await import("jsonwebtoken");
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET || "your-secret-key"
        );
        userId = decoded.id;
      } catch {}
    }

    const { role, cursor, limit = "15" } = req.query;
    const take = Math.min(parseInt(limit) || 15, 30);
    const where = role && role !== "all" ? { author: { role: role.toUpperCase() } } : {};

    const posts = await prisma.post.findMany({
      where,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: postInclude(userId),
    });

    const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;
    res.json({ posts: posts.map((p) => formatPost(p, userId)), nextCursor });
  } catch (error) {
    console.error("❌ getFeed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
}

export async function createPost(req, res) {
  try {
    const { content, image, pdfName, pdfSize } = req.body;
    if (!content?.trim() && !image) return res.status(400).json({ error: "Post must have content or an image" });
    if (content && content.length > 500) return res.status(400).json({ error: "Max 500 characters" });

    const post = await prisma.post.create({
      data: {
        content:  content?.trim() ?? "",
        image:    image    ?? null,
        pdfName:  pdfName  ?? null,
        pdfSize:  pdfSize  ?? null,
        authorId: req.userId,
      },
      include: postInclude(req.userId),
    });

    res.status(201).json({ post: formatPost(post, req.userId) });
  } catch (error) {
    console.error("❌ createPost error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post)                        return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.userId) return res.status(403).json({ error: "Not your post" });

    if (post.image) {
      try {
        const publicId = post.image.split("/upload/")[1]?.replace(/\.[^/.]+$/, "");
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch {}
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ deletePost error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
}

export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId: id, userId } } });
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
}

export async function toggleSave(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const existing = await prisma.postSave.findUnique({ where: { postId_userId: { postId: id, userId } } });
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
}

export async function getComments(req, res) {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const { default: jwt } = await import("jsonwebtoken");
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET || "your-secret-key");
        userId = decoded.id;
      } catch {}
    }
    const comments = await prisma.postComment.findMany({
      where:   { postId: req.params.id, parentId: null },
      orderBy: { createdAt: "asc" },
      include: commentInclude(userId),
    });
    res.json({ comments: comments.map((c) => formatComment(c, userId)) });
  } catch (error) {
    console.error("❌ getComments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
}

export async function addComment(req, res) {
  try {
    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
    const comment = await prisma.postComment.create({
      data: {
        content:  content.trim(),
        postId:   req.params.id,
        authorId: req.userId,
        parentId: parentId ?? null,
      },
      include: commentInclude(req.userId),
    });
    await prisma.post.update({ where: { id: req.params.id }, data: { commentsCount: { increment: 1 } } });
    res.status(201).json({ comment: formatComment(comment, req.userId) });
  } catch (error) {
    console.error("❌ addComment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
}

export async function toggleCommentLike(req, res) {
  try {
    const { commentId } = req.params;
    const userId        = req.userId;
    const existing = await prisma.postCommentLike.findUnique({ where: { commentId_userId: { commentId, userId } } });
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
}

export async function uploadFeedImage(req, res) {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: "No image file provided" });

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Upload timeout after 30 seconds")), 30000);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:        "feed",
          resource_type: "auto",
          transformation: [
            { width: 1080, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          clearTimeout(timeout);
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    console.log(`✅ Feed image uploaded: ${(result.bytes / 1024).toFixed(1)}KB`);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("❌ uploadFeedImage error:", error);
    if (error.message.includes("timeout")) return res.status(408).json({ error: "Upload timeout — please try again" });
    res.status(500).json({ error: "Image upload failed" });
  }
}