// backend/src/routes/social.routes.js
import express from "express";
import { getUsers, followUser, unfollowUser } from "../controllers/social.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users",            getUsers);                        // public — list users
router.post("/:userId/follow",  authenticate, followUser);        // auth — follow
router.delete("/:userId/follow",authenticate, unfollowUser);      // auth — unfollow

export default router;