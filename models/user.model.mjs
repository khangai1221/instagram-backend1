import mongoose from "mongoose";

export const UserModel = mongoose.model("User", {
    username: String,
    fullname: String,
    email: String,
    password: String,
    phone: String,
    avatar: String
});