// backend/server.js
import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import reelsRoutes from "./routes/reels.js";
import messagesRoutes from "./routes/messages.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";

import Message from "./models/Message.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

await connectDB(process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/public_uploads')));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// minimal root
app.get("/", (req, res) => res.send("MeteGram backend alive"));

// socket.io realtime
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", async (data) => {
    // Save message
    const { chatId, senderId, text, attachments } = data;
    const msg = new Message({ chatId, senderId, text, attachments: attachments || [] });
    await msg.save();
    io.to(chatId).emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    // console.log("disconnect", socket.id);
  });
});

server.listen(PORT, () => console.log(`MeteGram backend running on ${PORT}`));
