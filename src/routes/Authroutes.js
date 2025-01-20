const express = require("express");
const authRoutes = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const { validateSignupdata } = require("../Utils/Validatesignupdata");
const jwt = require("jsonwebtoken");

authRoutes.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    validateSignupdata(req);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    await user.save();
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Ensure cookies are sent over HTTPS
      sameSite: "None", // Allow cross-origin
      // secure: false, // Disable for local development (use true in production)
      // sameSite: "Lax", // Use "Lax" for local dev, "None" in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.send(user);
  } catch (err) {
    // console.log(err);
    res.status(400).send("cant save user" + " " + err.message);
  }
});

authRoutes.post("/login", async (req, res) => {
  try {
    // console.log("Request body:", req.body); // Log request body
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("invalid credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password); // Await here for async comparison
    // console.log("isMatch:", isMatch);
    if (isMatch) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Ensure cookies are sent over HTTPS
        sameSite: "None", // Allow cross-origin
        // secure: false, // Disable for local development (use true in production)
        // sameSite: "Lax", // Use "Lax" for local dev, "None" in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.send(user);
    } else {
      throw new Error("invalid credentials");
    }
  } catch (err) {
    res.status(400).send("Something Went wrong " + " " + err.message);
  }
});

authRoutes.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful");
});

module.exports = authRoutes;
