import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// GET single post by ID
router.get("/:id", async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id)
            .populate("user", "username fullname avatar");

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
            return res.status(400).json({ message: "description and userId required" });
        }

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await PostModel.create({
            description,
            imageUrl: imageUrl || "",
            user: user._id,
        });

        const populatedPost = await post.populate("user", "username fullname avatar");

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
            return res.status(403).json({ message: "Not authorized to edit this post" });
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
            return res.status(403).json({ message: "Not authorized to delete this post" });
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

// ADD comment to a post
router.post("/:id/comments", async (req, res) => {
    try {
        const { userId, username, text } = req.body;
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (!text || !username)
            return res.status(400).json({ message: "Comment text and username required" });

        if (!post.comments) post.comments = [];
        post.comments.push({ user: username, userId, text });
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.get("/", async (req, res) => {
    try {
        const posts = await PostModel.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;
