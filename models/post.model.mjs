import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        imageUrl: { type: String },
        user: { type: mongoose.Schema.Types.String, ref: "User", required: true },
        likes: { type: Number, default: 0 },
        likedUsers: [{ type: String, ref: "User" }],
        comments: [
            {
                userId: { type: String, ref: "User" },
                username: String,
                text: String,
            },
        ],
    },
    { timestamps: true }
);

export const PostModel = mongoose.model("Post", postSchema);
