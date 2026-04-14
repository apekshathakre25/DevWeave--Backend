const User = require("../model/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendEmail } = require("../utils/sendEmail");

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

const createToken = (user) =>
  jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
};

const createPasswordResetToken = () => {
  const token = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  return {
    token,
    hashedToken,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS),
  };
};

const getClientUrl = (req) => {
  const clientUrl = process.env.FRONTEND_URL;
  return clientUrl.replace(/\/+$/, "");
};

const getPasswordResetEmail = ({ name, resetLink }) => {
  const safeName = name || "there";
  const safeResetLink = resetLink;

  return {
    text: `Hi ${name || "there"}, use this link to reset your DevWeave password: ${resetLink}. This link expires in 1 hour.`,
    html: `
      <p>Hi ${safeName},</p>
      <p>Use the link below to reset your DevWeave password. It expires in 1 hour.</p>
      <p><a href="${safeResetLink}">Reset your password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };
};

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstname,
      lastname,
      email: normalizedEmail,
      password: hashpassword,
    });

    await user.save();
    const token = createToken(user);

    res.status(201).json({
      message: "User created successfully",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const comparePass = await bcrypt.compare(password, user.password);

    if (!comparePass) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    res.status(200).json({
      message: "User logged in successfully",
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const successMessage =
      "If an account exists with that email, a reset link has been sent.";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(200).json({ message: successMessage });
    }

    const { token, hashedToken, expiresAt } = createPasswordResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;

    await user.save({ validateBeforeSave: false });

    const resetLink = `${getClientUrl(req)}/reset-password/${token}`;
    const name = `${user.firstname || ""} ${user.lastname || ""}`.trim();
    const emailBody = getPasswordResetEmail({ name, resetLink });

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your DevWeave password",
        text: emailBody.text,
        html: emailBody.html,
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error("Failed to send password reset email:", emailError.message);
      return res.status(500).json({
        message: "Unable to send reset email. Please try again later.",
      });
    }

    return res.status(200).json({ message: successMessage });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const forgotPass = requestPasswordReset;

module.exports = {
  signup,
  login,
  forgotPass,
  requestPasswordReset,
  resetPassword,
};
