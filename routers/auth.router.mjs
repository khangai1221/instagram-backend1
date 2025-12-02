import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.mjs";

const router = express.Router();

// ===== Signup =====
router.post("/signup", async (req, res) => {
  try {
    const { credential, username, fullname, password } = req.body;
    if (!credential || !username || !fullname || !password)
      return res.status(400).send({ message: "All fields required" });

    let email = null,
      phone = null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(credential)) email = credential;
    else if (!isNaN(Number(credential))) phone = credential;
    else return res.status(400).send({ message: "Invalid credential" });

    const query = { username };
    if (email) query.email = email;
    if (phone) query.phone = phone;
    const existUser = await UserModel.findOne(query);
    if (existUser)
      return res.status(400).send({ message: "User already exists" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new UserModel({
      fullname,
      username,
      email,
      phone,
      password: hashedPassword,
    });
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.send({
      message: "User created",
      body: userResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
});

// ===== Signin =====
router.post("/signin", async (req, res) => {
  try {
    const { credential, password } = req.body;
    if (!credential || !password)
      return res
        .status(400)
        .send({ message: "Credential and password required" });

    const user = await UserModel.findOne({
      $or: [
        { email: credential },
        { phone: credential },
        { username: credential },
      ],
    });
    if (!user) return res.status(400).send({ message: "Wrong credentials!" });

    const isCorrectPassword = bcrypt.compareSync(password, user.password);
    if (!isCorrectPassword)
      return res.status(400).send({ message: "Wrong password!" });

    const token = jwt.sign(
      { id: user._id, username: user.username, fullname: user.fullname },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      message: "You are signed in",
      body: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error", error: err.message });
  }
});

// ===== Get users =====
router.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 });
    res.send({ message: "Users fetched", body: users });
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
});

export default router;
