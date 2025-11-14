const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  followers: { type: Number, default: 0 },
  following: { type: Array, default: [] },
  posts: { type: Array, default: [] }
});

module.exports = mongoose.model("User", UserSchema);
