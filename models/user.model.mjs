import mongoose from "mongoose";
import { nanoid } from "nanoid";

export const UserModel = mongoose.model(
    "User",
    new mongoose.Schema(
        {
            _id: { type: String, default: () => nanoid() },
            fullname: { type: String, required: true },
            username: { type: String, required: true },
            email: { type: String, default: null },
            phone: { type: String, default: null },
            password: { type: String, required: true },
            avatar: { type: String, default: "" },
        },
        { timestamps: true }
    )
);
