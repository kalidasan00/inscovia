// backend/src/routes/search.routes.js
import express from "express";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/", search);

export default router;