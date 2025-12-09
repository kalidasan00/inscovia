import express from "express";
import {
  registerInstitute,
  loginInstitute,
  getCurrentUser
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerInstitute);
router.post("/login", loginInstitute);
router.get("/me", authenticate, getCurrentUser);

export default router;