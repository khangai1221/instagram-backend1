import mongoose from "mongoose";

export const UserModel = mongoose.model(
    "User",
    new mongoose.Schema(
        {
            fullname: { type: String, required: true },
            username: { type: String, required: true, unique: true },
            email: { type: String, default: null },
            phone: { type: String, default: null },
            password: { type: String, required: true },
            avatar: { type: String, default: "" },
        },
        { timestamps: true }
    )
);
