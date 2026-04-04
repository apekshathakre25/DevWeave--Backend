const {
  sendConnectionRequest,
  reviewConnectionRequest,
} = require("../controller/connectionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  sendConnectionRequest,
);

router.post(
  "/request/review/:status/:requestId",
  authMiddleware,
  reviewConnectionRequest,
);

module.exports = router;
