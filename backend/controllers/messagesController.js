// backend/controllers/messagesController.js
import Message from "../models/Message.js";

export async function getMessages(req, res) {
  const { chatId } = req.params;
  const msgs = await Message.find({ chatId }).sort({ createdAt: 1 }).populate("senderId","username");
  res.json(msgs);
}
