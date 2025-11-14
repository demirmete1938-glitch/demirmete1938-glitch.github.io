// backend/controllers/authController.js
import User from "../models/User.js";

export async function register(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("username/password required");
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).send("username taken");
  const user = await User.create({ username, password });
  res.json(user);
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send("invalid credentials");
  res.json(user);
                                         }
