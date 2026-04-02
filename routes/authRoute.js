const { signup, login, forgotPass } = require("../controller/authController");
const express = require("express");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPass", forgotPass);

module.exports = router;
