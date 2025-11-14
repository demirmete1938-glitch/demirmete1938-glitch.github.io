// backend/controllers/adminController.js
import User from "../models/User.js";

export async function adminLogin(req, res) {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) return res.json({ ok: true });
  return res.status(403).json({ ok: false });
}

export async function deleteUser(req, res) {
  const { userId } = req.body;
  await User.findByIdAndDelete(userId);
  res.json({ ok: true });
}

export async function setFollowers(req, res) {
  const { userId, followers } = req.body;
  const user = await User.findById(userId);
  if(!user) return res.status(404).json({ ok:false });
  user.followers = Number(followers);
  await user.save();
  res.json({ ok:true, user });
}
