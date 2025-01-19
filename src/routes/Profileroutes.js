const express = require("express");
const profileRoutes = express.Router();
const { adminauth } = require("../Middlewares/Auth");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
profileRoutes.get("/profile", adminauth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Something Went wrong" + " " + err.message);
  }
});

profileRoutes.patch("/profile/password", async (req, res) => {
  try {
    const { emailId, password, newpassword } = req.body;
    //   first we check that user is valid or not
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const newPass = await bcrypt.hash(newpassword, 10);
      const userpass = await User.findByIdAndUpdate(user._id, {
        password: newPass,
      });
      await userpass.save();

      res.send(
        "hello " +
          `${user.firstName}` +
          " your password is successfully updated"
      );
    } else {
      throw new Error("invalid credentials");
    }
  } catch (err) {
    res.status(400).send("Something Went wrong" + " " + err.message);
  }
});

module.exports = profileRoutes;
