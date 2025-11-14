const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Post = require("./models/Post");
const Story = require("./models/Story");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB bağlantısı
mongoose.connect("mongodb://127.0.0.1:27017/metegram", {
  useNewUrlParser: true, useUnifiedTopology: true
});

// Login
app.post("/login", async (req,res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if(user) res.send(user);
  else res.status(401).send("Hatalı kullanıcı adı veya şifre");
});

// Feed
app.get("/feed", async (req,res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate("userId","username");
  res.send(posts);
});

// Follow
app.post("/user/follow", async (req,res) => {
  const { userId, targetId } = req.body;
  const user = await User.findById(userId);
  const target = await User.findById(targetId);
  if(!user.following.includes(targetId)) {
    user.following.push(targetId);
    target.followers += 1;
  } else {
    user.following = user.following.filter(id => id != targetId);
    target.followers -= 1;
  }
  await user.save();
  await target.save();
  res.send("Takip güncellendi");
});

// Like
app.post("/post/like", async (req,res) => {
  const { postId } = req.body;
  const post = await Post.findById(postId);
  post.likes += 1;
  await post.save();
  res.send("Beğeni eklendi");
});

// Founder API
app.post("/founder/delete-user", async (req,res) => {
  if(req.body.role !== "founder") return res.status(403).send("Yetkin yok kral!");
  await User.findByIdAndDelete(req.body.userId);
  await Post.deleteMany({ userId: req.body.userId });
  res.send("Kullanıcı silindi");
});

app.post("/founder/boost-followers", async (req,res) => {
  if(req.body.role !== "founder") return res.status(403).send("Yetkin yok kral!");
  const user = await User.findById(req.body.userId);
  if(!user) return res.status(404).send("Kullanıcı yok kral!");
  user.followers += Number(req.body.amount);
  await user.save();
  res.send("Takipçi artırıldı");
});

// Story
app.post("/story/create", async (req,res) => {
  const story = new Story(req.body);
  await story.save();
  res.send(story);
});

app.get("/story/feed", async (req,res) => {
  const stories = await Story.find({ expiresAt: { $gt: new Date() } }).populate("userId","username");
  res.send(stories);
});

// Keşfet
app.get("/explore", async (req,res) => {
  const posts = await Post.find().sort({ likes: -1 }).limit(20).populate("userId","username");
  res.send(posts);
});

app.listen(5000, () => console.log("Backend 5000 portta çalışıyor kral"));
