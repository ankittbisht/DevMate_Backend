const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const adminauth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
  
    const { token } = cookies;
   
    if (!token) {
      return res.status(401).send("Please Log in ");
    }
    const decodedtoken = jwt.verify(token, process.env.JWT_SECRET);
   
    const user = await User.findById(decodedtoken);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Something Went wrong" + err.message);
  }
};

module.exports = { adminauth };
