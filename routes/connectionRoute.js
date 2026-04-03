const { sendConnectionRequest } = require("../controller/connectionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  sendConnectionRequest,
);

module.exports = router;
