const express = require("express");
const app = express();
const { adminauth } = require("./Middlewares/Auth");
const { connectDB } = require("./Config/Database");
const { adminauth } = require("./Middlewares/Auth");
const User = require("./Models/User");

//Middleware for parsing json to js objects
app.use(express.json());


app.post("/signup", async (req, res) => {
  // console.log(req.body.firstName + " " + req.body.lastName);
  const user = new User(req.body);
  try {
    await user.save();
    res.send("User registered successfully");
  } catch (err) {
    res.status(400).send("cant save user" + err.message);
  }
});

//Get user information
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const userInfo = await User.findOne({ emailId: userEmail });
    if (userInfo) {
      res.send(userInfo);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});

//Getting all user information
app.get("/feed", async (req, res) => {
  try {
    const userInfo = await User.find({});
    if (userInfo) {
      res.send(userInfo);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});

// deleting user
app.delete("/user", async (req, res) => {
  const id = req.body.id;
  try {
    const userInfo = await User.findById(id);
    if (!userInfo) {
      return res.status(404).send("User not found");
    }
    // If user exists, delete them
    await User.findByIdAndDelete(id);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});

// Updating user info
app.patch("/user", async (req, res) => {
  const id = req.body.id;
  try {
    const userInfo = await User.findById(id);
    if (!userInfo) {
      return res.status(404).send("User not found");
    }

    await User.findByIdAndUpdate(id, req.body);
    res.send("User updated  successfully");
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});

app.use("/admin", adminauth);
// creating middlewares
app.post("/admin", (req, res) => {
  res.send("Accessing admin area");
});

app.post("/admin/1", (req, res) => {
  res.send("Accessing user 1");
});

//fun with routes
app.get("/", (req, res) => {
  res.send("Lets see what happened");
});

app.get("/users/:userId/books/:bookId", (req, res) => {
  res.send(req.params);
});

app.get("/test", (req, res) => {
  res.send("Getting the test route using GET method");
});

app.post("/test", (req, res) => {
  res.send("Posting the test route using POST method");
});

// this route is available for all routes if place at top
app.use("/", (err, req, res) => {
  if (err) {
    res.semd("Error ");
  } else {
    res.send("Hello World");
  }
});

app.listen(7777, () => {
  console.log("Port is listening at 7777");
});
