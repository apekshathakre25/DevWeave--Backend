const jwt = require("jsonwebtoken");
const User = require("../model/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

     const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    if (!verifyToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { _id } = verifyToken;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = {
  authMiddleware,
};
