const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Post = require("./models/Post");
const Story = require("./models/Story");
const Reel = require("./models/Reel");
const Chat = require("./models/Chat");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/metegram", { useNewUrlParser: true, useUnifiedTopology: true });

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

// Story
app.post("/story/create", async (req,res) => { const story = new Story(req.body); await story.save(); res.send(story); });
app.get("/story/feed", async (req,res) => { const stories = await Story.find({ expiresAt: { $gt: new Date() } }).populate("userId","username"); res.send(stories); });

// Reels
app.post("/reel/create", async (req,res)=>{ const reel = new Reel(req.body); await reel.save(); res.send(reel); });
app.get("/reel/feed", async (req,res)=>{ const reels = await Reel.find().sort({ createdAt:-1 }).populate("userId","username"); res.send(reels); });
app.post("/reel/like", async (req,res)=>{ const { reelId } = req.body; const reel = await Reel.findById(reelId); reel.likes+=1; await reel.save(); res.send("Reel beğenildi"); });

// Chat
app.post("/chat/send", async (req,res)=>{
  const { chatId, senderId, text } = req.body;
  const chat = await Chat.findById(chatId);
  chat.messages.push({ sender: senderId, text });
  await chat.save();
  res.send(chat);
});
app.get("/chat/list/:userId", async (req,res)=>{
  const chats = await Chat.find({ participants: req.params.userId }).populate("participants","username").populate("messages.sender","username");
  res.send(chats);
});

// Follow
app.post("/user/follow", async (req,res)=>{
  const { userId,targetId } = req.body;
  const user = await User.findById(userId);
  const target = await User.findById(targetId);
  if(!user.following.includes(targetId)){ user.following.push(targetId); target.followers+=1; }
  else { user.following = user.following.filter(id => id!=targetId); target.followers-=1; }
  await user.save(); await target.save();
  res.send("Takip güncellendi");
});

// Like post
app.post("/post/like", async (req,res)=>{ const { postId } = req.body; const post = await Post.findById(postId); post.likes+=1; await post.save(); res.send("Beğeni eklendi"); });

// Founder admin
app.post("/founder/delete-user", async (req,res)=>{ if(req.body.role!=="founder") return res.status(403).send("Yetkin yok kral!"); await User.findByIdAndDelete(req.body.userId); await Post.deleteMany({ userId:req.body.userId }); res.send("Kullanıcı silindi"); });
app.post("/founder/boost-followers", async (req,res)=>{ if(req.body.role!=="founder") return res.status(403).send("Yetkin yok kral!"); const user = await User.findById(req.body.userId); if(!user) return res.status(404).send("Kullanıcı yok kral!"); user.followers+=Number(req.body.amount); await user.save(); res.send("Takipçi artırıldı"); });

app.listen(5000,()=>console.log("Backend 5000 portta çalışıyor kral"));
