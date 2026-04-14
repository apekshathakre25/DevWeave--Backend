const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    lastname: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        }
      },
    },
    profilePicture: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/045/711/163/non_2x/default-avatar-female-profile-icon-grey-photo-placeholder-gray-profile-anonymous-face-picture-illustration-for-social-media-dating-profile-forum-vector.jpg",
      // validate(value) {
      //   if (!validator.isURL(value)) {
      //     throw new Error("Invalid URL for profile picture");
      //   }
      // },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      maxLength: 500,
      default: "Looking forward to connect with you!",
    },
    skills: {
      type: [String],
      default: [],
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(_, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
