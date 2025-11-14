// backend/routes/posts.js
import express from "express";
import { getFeed, likePost } from "../controllers/postsController.js";
const router = express.Router();

router.get("/feed", getFeed);
router.post("/like", likePost);

export default router;
