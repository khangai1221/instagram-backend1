import express from "express";
import { PostModel } from "../models/post.model.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
    const result = await PostModel.find();
    return res.send(result);
});

router.get("/:id", async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) {
        return res.status(404).send({ message: "Post not found!" });
    }
    return res.send(post);
});

router.post("/", async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Body required!" });
    }
    const { description, imageUrl } = req.body;

    if (!description) {
        return res.status(400).send({ message: "description required!" });
    }
    if (!imageUrl) {
        return res.status(400).send({ message: "imageUrl required!" });
    }
    const post = await PostModel.create({ description, imageUrl }, { isNew: true });
    return res.send({ message: "Post created successfully", body: post });
});

router.delete("/:id", async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) {
        return res.status(404).send({ message: "Post not found!" });
    }
    await PostModel.deleteOne({ _id: postId });
    return res.send({ message: "Successfully deleted post" });
});

router.put("/:id", async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) {
        return res.status(404).send({ message: "Post not found!" });
    }
    if (!req.body) {
        return res.status(400).send({ message: "Body required!" });
    }
    const { description, imageUrl } = req.body;

    await PostModel.updateOne({ _id: postId }, { description, imageUrl });

    return res.send({ message: "Successfully updated post", body: { ...post, description, imageUrl } });
});

router.patch("/:id", async (req, res) => {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) {
        return res.status(404).send({ message: "Post not found!" });
    }
    if (!req.body) {
        return res.status(400).send({ message: "Body required!" });
    }
    const { description, imageUrl } = req.body;

    await PostModel.updateOne({ _id: postId }, { description, imageUrl });

    return res.send({ message: "Successfully updated post", body: { ...post, description, imageUrl } });
});

export default router;