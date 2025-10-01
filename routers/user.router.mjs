import express from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// GET /users  <-- no change needed
router.get("/", async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 });
        res.send({ message: "Users fetched", body: users });
    } catch (err) {
        res.status(500).send({ message: "Server error", error: err });
    }
});

export default router;
