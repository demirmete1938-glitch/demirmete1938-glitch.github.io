// backend/routes/reels.js
import express from "express";
import { uploadReel, listReels, likeReel } from "../controllers/reelsController.js";
const router = express.Router();

router.post("/upload", uploadReel);
router.get("/feed", listReels);
router.post("/like", likeReel);

export default router;
