const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    
    const { username, password } = req.body;
    if(!username|| !password) return res.status(400).json({ message: "User creation error" });
    const hashPass = await bcrypt.hash(password, 10);
    const user = new User({ userName: username, password: hashPass });
    await user.save();
    return res.status(201).json({ message: "user created!" });
  } catch (error) {
    console.log(error);
    
    res.status(400).json({ message: "User creation error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ userName: username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "user not found!" });
    }

    res.status(200).json({ message: "login success", status: true, username:user.userName });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
});

module.exports = router;