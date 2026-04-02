const { profile, updateProfile } = require("../controller/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");

const router = express.Router();

router.get("/profile", authMiddleware, profile);
router.patch("/profile", authMiddleware, updateProfile)

module.exports = router;
