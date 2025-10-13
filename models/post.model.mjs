import mongoose from "mongoose";
export const PostModel = mongoose.model(
    "Post",
    new mongoose.Schema(
        {
            user: { type: String, ref: "User", required: true },
            description: { type: String, required: true },
            imageUrl: { type: String, required: true },
            likes: { type: Number, default: 0 },
            likedUsers: [{ type: String, ref: "User" }],
            comments: [
                {
                    userId: { type: String },
                    user: { type: String, required: true },
                    text: { type: String, required: true },
                    createdAt: { type: Date, default: Date.now },
                },
            ],
        },
        { timestamps: true } // <-- move timestamps here
    )
);
