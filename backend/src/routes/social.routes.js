// backend/src/routes/social.routes.js
import express from "express";
import {
  getUsers, followUser, unfollowUser,
  getUserProfile, getUserPosts,
} from "../controllers/social.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users",                    getUsers);
router.get("/users/:username",          getUserProfile);
router.get("/users/:username/posts",    getUserPosts);
router.post("/:userId/follow",          authenticate, followUser);
router.delete("/:userId/follow",        authenticate, unfollowUser);

export default router;