// backend/models/Message.js
import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  size: Number,
  url: String
});

const MessageSchema = new mongoose.Schema({
  chatId: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", MessageSchema);
