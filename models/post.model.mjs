import mongoose from "mongoose";

export const PostModel = mongoose.model("Post", {
    description: String,
    imageUrl: String,

    createdAt: Date,
    updatedAt: Date,
});