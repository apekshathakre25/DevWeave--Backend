const {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
  forgotPass,
} = require("../controller/authController");
const express = require("express");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/forgotPass", forgotPass);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
