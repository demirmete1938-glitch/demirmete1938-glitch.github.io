// backend/routes/messages.js
import express from "express";
import { getMessages } from "../controllers/messagesController.js";
const router = express.Router();

router.get("/:chatId", getMessages);

export default router;
