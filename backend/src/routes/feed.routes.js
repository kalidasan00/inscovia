// backend/src/routes/feed.routes.js
import express from "express";
import {
  getFeed, createPost, deletePost, toggleLike, toggleSave,
  getComments, addComment, toggleCommentLike,
  uploadFeedImage,
} from "../controllers/feed.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadSingle, handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// ✅ Public — anyone can read
router.get("/", getFeed);
router.get("/:id/comments", getComments);

// ✅ Specific static routes FIRST (before any /:id routes)
router.post("/upload/image", authenticate, uploadSingle, handleUploadError, uploadFeedImage);

// ✅ Auth required
router.post("/", authenticate, createPost);
router.delete("/:id", authenticate, deletePost);
router.patch("/:id/like", authenticate, toggleLike);
router.patch("/:id/save", authenticate, toggleSave);
router.post("/:id/comments", authenticate, addComment);
router.patch("/comments/:commentId/like", authenticate, toggleCommentLike);

export default router;