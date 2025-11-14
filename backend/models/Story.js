const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: String,
  caption: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => Date.now() + 24*60*60*1000 } // 24 saat
});

module.exports = mongoose.model("Story", StorySchema);
