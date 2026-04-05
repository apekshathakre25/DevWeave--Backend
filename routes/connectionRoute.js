const {
  sendConnectionRequest,
  reviewConnectionRequest,
  getAllConnection,
  getPendingConnection,
  getFeed,
} = require("../controller/connectionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.get("/feed", authMiddleware, getFeed);

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

router.get("/pending/connections", authMiddleware, getPendingConnection);

router.get("/accepted/connections", authMiddleware, getAllConnection);

module.exports = router;
