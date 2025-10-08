import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// ===== Get all posts =====
router.get("/", async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate("user", "username fullname avatar") // populate user info
            .sort({ createdAt: -1 });

        res.send(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});
// Toggle like
router.post("/:id/like", async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.body.userId; // frontend sends this
        if (!userId) return res.status(400).send({ message: "userId required" });

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).send({ message: "Post not found" });

        // store liked users in an array (optional: you can track user-specific likes)
        if (!post.likedUsers) post.likedUsers = [];

        const likedIndex = post.likedUsers.indexOf(userId);
        if (likedIndex === -1) {
            post.likedUsers.push(userId); // like
        } else {
            post.likedUsers.splice(likedIndex, 1); // unlike
        }

        post.likes = post.likedUsers.length; // update likes count
        await post.save();

        res.send({ message: "Post updated", likes: post.likes, likedUsers: post.likedUsers });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
});

// ===== Create post =====
router.post("/", async (req, res) => {
    try {
        const { description, imageUrl, userId } = req.body; // userId must be provided by frontend
        if (!description || !imageUrl || !userId)
            return res.status(400).send({ message: "description, imageUrl and userId required" });

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).send({ message: "User not found" });

        const post = await PostModel.create({
            description,
            imageUrl,
            user: user._id,
        });

        const populatedPost = await post.populate("user", "username fullname avatar");
        res.send({ message: "Post created", body: populatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});

export default router;
