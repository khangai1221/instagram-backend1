// app.mjs
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

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

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.resolve("./uploads")));

// --- ROUTES ---
app.get("/", (req, res) => {
  res.send("Hi server");
});

app.use("/posts", PostRouter); // Handles upload + get posts
app.use(AuthRouter);            // Auth routes
app.use("/users", userRouter);  // User routes

// --- MONGODB CONNECTION & SERVER START ---
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
