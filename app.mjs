import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import PostRouter from "./routers/post.router.mjs";
import AuthRouter from "./routers/auth.router.mjs";
import userRouter from "./routers/user.router.mjs";

dotenv.config();

const PORT = process.env.PORT || 5500;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("Error: MONGO_URL is not set in your environment variables.");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded images

app.get("/", (req, res) => {
  res.send("Hi server");
});

app.use("/api/posts", PostRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", userRouter);

// Connect to MongoDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
