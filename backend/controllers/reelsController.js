// backend/controllers/reelsController.js
import Reel from "../models/Reel.js";

export async function uploadReel(req, res) {
  const { userId, videoUrl, caption } = req.body;
  const reel = await Reel.create({ userId, videoUrl, caption });
  res.json(reel);
}

export async function listReels(req, res) {
  const reels = await Reel.find().sort({ createdAt: -1 }).populate("userId","username profilePic");
  res.json(reels);
}

export async function likeReel(req, res) {
  const { reelId } = req.body;
  const reel = await Reel.findById(reelId);
  if(!reel) return res.status(404).send("no reel");
  reel.likes += 1;
  await reel.save();
  res.json({ ok:true, likes: reel.likes });
}
