// backend/config/db.js
import mongoose from "mongoose";

export async function connectDB(uri) {
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("MongoDB connected");
}
