import express from "express";
import { PostModel } from "../models/post.model.mjs";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate("user", "username fullname avatar")
            .sort({ createdAt: -1 });
        res.send(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});
router.post("/:postId/comments", async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, username, text } = req.body;

        if (!text || !username) {
            return res.status(400).json({ message: "Comment text and username required" });
        }

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ user: username, text, userId });
        await post.save();

        res.status(200).json(post); // send back updated post
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



router.post("/:id/like", async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.body.userId;
        if (!userId) return res.status(400).send({ message: "userId required" });

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).send({ message: "Post not found" });

        if (!post.likedUsers) post.likedUsers = [];

        const likedIndex = post.likedUsers.indexOf(userId);
        if (likedIndex === -1) {
            post.likedUsers.push(userId);
        } else {
            post.likedUsers.splice(likedIndex, 1);
        }

        post.likes = post.likedUsers.length;
        await post.save();

        res.send({
            message: "Post updated",
            likes: post.likes,
            likedUsers: post.likedUsers,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { description, imageUrl, userId } = req.body;
        if (!description || !imageUrl || !userId)
            return res
                .status(400)
                .send({ message: "description, imageUrl and userId required" });

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

router.patch("/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const { description, imageUrl, userId } = req.body;

        if (!userId) return res.status(400).send({ message: "userId required" });

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).send({ message: "Post not found" });

        if (post.user.toString() !== userId)
            return res.status(403).send({ message: "Not authorized to edit this post" });

        if (description) post.description = description;
        if (imageUrl) post.imageUrl = imageUrl;

        await post.save();
        const updatedPost = await post.populate("user", "username fullname avatar");

        res.send({ message: "Post updated", post: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;

        if (!userId) return res.status(400).send({ message: "userId required" });

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).send({ message: "Post not found" });

        if (post.user.toString() !== userId)
            return res.status(403).send({ message: "Not authorized to delete this post" });

        await PostModel.findByIdAndDelete(postId);
        res.send({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});

export default router;
