import express from "express";
import { getCenters, getCenterById, updateCenter, uploadLogo, uploadCoverImage } from "../controllers/centers.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getCenters);
router.get("/:id", getCenterById);
router.put("/:id", authenticate, updateCenter);
router.post("/:id/upload-logo", authenticate, upload.single("logo"), uploadLogo);
router.post("/:id/upload-cover", authenticate, upload.single("image"), uploadCoverImage);

export default router;