import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        description: String,
        imageUrl: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        likes: { type: Number, default: 0 },
        likedUsers: { type: [String], default: [] }, // store userIds
    },
    { timestamps: true } // auto-manage createdAt and updatedAt
);

export const PostModel = mongoose.model("Post", PostSchema);
