// backend/src/routes/college.routes.js
import express from "express";
import {
  getColleges,
  getCollegeBySlug,
  updateCollege,
  uploadCollegeLogo,
  uploadCollegeCover,
} from "../controllers/college.controller.js";
import {
  uploadCollegeGalleryImage,
  deleteCollegeGalleryImage,
} from "../controllers/gallery.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import upload, { uploadGallery } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getColleges);
router.get("/:slug", getCollegeBySlug);
router.put("/:slug", authenticate, updateCollege);

// Same field names as the center routes: "logo" and "image"
router.post("/:slug/upload-logo", authenticate, upload.single("logo"), uploadCollegeLogo);
router.post("/:slug/upload-cover", authenticate, upload.single("image"), uploadCollegeCover);

// Reuses the shared upload.js middleware (uploadGallery = upload.single("image"))
router.post("/:slug/upload-gallery", authenticate, uploadGallery, uploadCollegeGalleryImage);
router.delete("/:slug/delete-gallery", authenticate, deleteCollegeGalleryImage);

export default router;