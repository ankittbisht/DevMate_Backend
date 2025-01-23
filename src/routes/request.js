const express = require("express");
const requestRouter = express.Router();
const ConnectionRequest = require("../Models/connectionRequestSchema");
const User = require("../Models/User");
const { adminauth } = require("../Middlewares/Auth");

requestRouter.post(
  "/request/send/:status/:toUserId",
  adminauth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: " invalid status type " + status });
      }

      //check if touserId exist or not
      const toUser = await User.findById(toUserId);

      if (!toUser) {
        return res.status(404).send({ message: "User Not Found!!" });
      }

      //checking that if the request is send already or have a connection
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({
        message:
          req.user.firstName + " is" + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("Erro: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  adminauth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type " + status });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request Not found" });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({ message: " connection request " + status, data });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  }
);

requestRouter.patch(
  "/request/ignored/:toUserId",
  adminauth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;

      const connectionRequests = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId, status: "accepted" },
          { fromUserId: toUserId, toUserId: fromUserId, status: "accepted" },
        ],
      });

      if (!connectionRequests) {
        return res.status(400).send({ message: "No such connection exists" });
      }

      await connectionRequests.updateOne({ status: "ignored" });

      res.json({ message: "Connection request has been ignored." });
    } catch (err) {
      console.error("Error ignoring connection request:", err);
      res.status(500).send({ error: "An internal server error occurred." });
    }
  }
);

module.exports = requestRouter;
