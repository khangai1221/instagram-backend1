import express from "express";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await UserModel.find().select("_id username fullname createdAt");

        res.send({ message: "Users fetched", body: users });

    } catch (err) {
        res.status(500).send({ message: "Server error", error: err });
    }
});
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { fullname, username, bio, website, avatar } = req.body;

    try {
        const user = await UserModel.findByIdAndUpdate(
            id,
            { fullname, username, bio, website, avatar },
            { new: true }
        );

        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});
// Toggle follow/unfollow
// Toggle follow/unfollow
router.post("/:id/follow", async (req, res) => {
    const { id } = req.params; // target user
    const { followerId } = req.body; // current user

    if (!followerId) return res.status(400).json({ msg: "followerId missing" });

    try {
        const targetUser = await UserModel.findById(id);
        const currentUser = await UserModel.findById(followerId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Ensure followers/following are arrays
        targetUser.followers = Array.isArray(targetUser.followers) ? targetUser.followers : [];
        currentUser.following = Array.isArray(currentUser.following) ? currentUser.following : [];

        let isFollowing;
        if (targetUser.followers.includes(followerId)) {
            // Unfollow
            targetUser.followers = targetUser.followers.filter((id) => id !== followerId);
            currentUser.following = currentUser.following.filter((id) => id !== id);
            isFollowing = false;
        } else {
            // Follow
            targetUser.followers.push(followerId);
            currentUser.following.push(id);
            isFollowing = true;
        }

        await targetUser.save();
        await currentUser.save();

        res.json({
            isFollowing,
            followers: targetUser.followers,
            following: currentUser.following,
            followersCount: targetUser.followers.length,
            followingCount: currentUser.following.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET /users/:username
router.get("/:username", async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.params.username });

        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            avatar: user.avatar,
            bio: user.bio,
            website: user.website,
            followers: user.followers, // array
            following: user.following, // array
            followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
            followingCount: Array.isArray(user.following) ? user.following.length : 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

export default router;
