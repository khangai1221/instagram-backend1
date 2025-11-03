import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// ---------------------- GET SINGLE POST ----------------------
router.get("/:id", async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id)
            .populate("user", "username fullname avatar"); // populate user

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------------- GET ALL POSTS ----------------------
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};

        const posts = await PostModel.find(filter)
            .populate("user", "username fullname avatar")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------------- CREATE POST ----------------------
router.post("/", async (req, res) => {
    try {
        const { description, imageUrl, userId } = req.body;
        if (!description || !imageUrl || !userId) {
            return res.status(400).json({ message: "description, imageUrl and userId required" });
        }

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await PostModel.create({ description, imageUrl, user: user._id });
        const populatedPost = await post.populate("user", "username fullname avatar");

        res.json(populatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------------- UPDATE POST ----------------------
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

// ---------------------- DELETE POST ----------------------
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

// ---------------------- TOGGLE LIKE ----------------------
router.post("/:id/like", async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (!post.likedUsers) post.likedUsers = [];

        const index = post.likedUsers.indexOf(userId);
        if (index === -1) post.likedUsers.push(userId); // add like
        else post.likedUsers.splice(index, 1); // remove like

        post.likes = post.likedUsers.length;
        await post.save();

        res.json({
            likes: post.likes,
            likedUsers: post.likedUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ---------------------- ADD COMMENT ----------------------
router.post("/:id/comments", async (req, res) => {
    try {
        const { userId, username, text } = req.body;
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (!text || !username) return res.status(400).json({ message: "Comment text and username required" });

        if (!post.comments) post.comments = [];
        post.comments.push({ user: username, userId, text });
        await post.save();

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
