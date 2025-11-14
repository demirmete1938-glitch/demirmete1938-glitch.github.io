// backend/controllers/postsController.js
import Post from "../models/Post.js";

export async function getFeed(req, res) {
  const posts = await Post.find().sort({ createdAt: -1 }).populate("userId", "username profilePic");
  res.json(posts);
}

export async function likePost(req, res) {
  const { postId } = req.body;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).send("no post");
  post.likes += 1;
  await post.save();
  res.json({ ok: true, likes: post.likes });
    }
