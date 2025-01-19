require("dotenv").config();

const express = require("express");
const app = express();
const { connectDB } = require("./src/Config/Database");
const cookieParser = require("cookie-parser");
const authRoutes = require("./src/routes/Authroutes");
const profileRoutes = require("./src/routes/Profileroutes");
const requestRoutes = require("./src/routes/request");
const userRoutes = require("./src/routes/userroutes");
const cors = require("cors");

// Middleware for avoiding cors error also dont forget to add withCredentials: true in frontend so to add cokies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies
  })
);

//Middleware for parsing json to js objects
app.use(express.json());
app.use(cookieParser());

app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", requestRoutes);
app.use("/", userRoutes);

connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(7777, () => {
      console.log("Port is listening at 7777");
    });
  })
  .catch((err) => {
    console.error("db connection error " + err.message);
  });
