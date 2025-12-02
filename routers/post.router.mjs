import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// GET single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate(
      "user",
      "username fullname avatar"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { description, imageUrl, userId } = req.body;

    if (!description || !userId) {
      return res
        .status(400)
        .json({ message: "description and userId required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await PostModel.create({
      description,
      imageUrl: imageUrl || "",
      user: user._id,
    });

    const populatedPost = await post.populate(
      "user",
      "username fullname avatar"
    );

    res.json({ message: "Post created", body: populatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE a post
router.patch("/:id", async (req, res) => {
  try {
    const { description, imageUrl, userId } = req.body;
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    if (description) post.description = description;
    if (imageUrl) post.imageUrl = imageUrl;

    await post.save();
    const updatedPost = await post.populate("user", "username fullname avatar");
    res.json({ post: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE a post
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await PostModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIKE / UNLIKE a post
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likedUsers) post.likedUsers = [];

    const index = post.likedUsers.indexOf(userId);
    if (index === -1) post.likedUsers.push(userId);
    else post.likedUsers.splice(index, 1);

    post.likes = post.likedUsers.length;
    await post.save();

    res.json({
      likes: post.likes,
      likedUsers: post.likedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.post("/upload", async (req, res) => {
  try {
    const { description, imageUrl } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Decode JWT (make sure your secret matches)
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!description)
      return res.status(400).json({ message: "Description required" });

    const newPost = await PostModel.create({
      description,
      imageUrl,
      user: payload.id, // store the real user id
    });

    const populatedPost = await newPost.populate(
      "user",
      "username fullname avatar"
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD comment to a post
router.post("/:id/comments", async (req, res) => {
  try {
    const { userId, username, text } = req.body;
    const post = await PostModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!text || !username)
      return res
        .status(400)
        .json({ message: "Comment text and username required" });

    if (!post.comments) post.comments = [];
    post.comments.push({ user: username, userId, text });
    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// ✅ GET all posts OR posts by a specific user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query; // get userId from query string, e.g. /posts?userId=123

    // if userId is provided, filter by that user — otherwise return all posts
    const filter = userId ? { user: userId } : {};

    const posts = await PostModel.find(filter)
      .populate("user", "username fullname avatar") // include limited user info
      .sort({ createdAt: -1 }); // newest first

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
