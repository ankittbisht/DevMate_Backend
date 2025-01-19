const express = require("express");
const app = express();
const userRoutes = express.Router();
const { adminauth } = require("../Middlewares/Auth");
const ConnectionRequest = require("../Models/connectionRequestSchema");
const User = require("../Models/User");

userRoutes.get("/user/request/received", adminauth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // Retrieve all received requests by the loggedInUser
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
      // status: "received",
    }).populate("fromUserId", ["firstName", "lastName"]);
    res.json({ message: "connection request found", connectionRequest });
  } catch (err) {
    res.status(500).send("Server Error" + err.message);
  }
});

userRoutes.get("/user/connection", adminauth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // Retrieve all received requests by the loggedInUser
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
      // status: "received",
    })
      .populate("fromUserId", ["firstName", "lastName"])
      .populate("toUserId", ["firstName", "lastName"]);
    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({
      message: "connection request found",
      data,
    });
  } catch (err) {
    res.status(500).send("Something Went wrong " + err.message);
  }
});

userRoutes.get("/user/feed", adminauth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Queries the ConnectionRequest collection to find connection requests where:
    // The logged-in user sent a request (fromUserId).
    // The logged-in user received a request (toUserId).
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Loops through connectionRequests and adds fromUserId and toUserId to the set.
    const hiddenUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hiddenUsersFromFeed.add(req.fromUserId.toString());
      hiddenUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hiddenUsersFromFeed) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select("firstName lastName ")
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRoutes;
