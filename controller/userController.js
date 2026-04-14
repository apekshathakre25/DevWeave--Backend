const bcrypt = require("bcrypt");

const profile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    const allowedFields = [
      "firstname",
      "lastname",
      "age",
      "skills",
      "about",
      "profilePicture",
      "gender",
    ];

    const isValidUpdate = Object.keys(req.body).every((key) =>
      allowedFields.includes(key),
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        message:
          "Only firstname, lastname, skills, age, about, profilePicture, and gender can be updated",
      });
    }

    const updates = { ...req.body };

    if (updates.skills !== undefined) {
      if (Array.isArray(updates.skills)) {
        updates.skills = updates.skills
          .map((skill) => String(skill).trim())
          .filter(Boolean);
      } else if (typeof updates.skills === "string") {
        updates.skills = updates.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      } else {
        return res.status(400).json({ message: "Skills must be an array" });
      }
    }

    if (updates.age !== undefined) {
      updates.age = Number(updates.age);

      if (!Number.isFinite(updates.age) || updates.age < 0) {
        return res.status(400).json({ message: "Age must be a valid number" });
      }
    }

    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong while updating profile",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { password, newPass } = req.body;

    if (!password || !newPass) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const ExistingPass = await bcrypt.compare(password, user.password);
    if (!ExistingPass) {
      return res.status(400).json({ message: "password is invalid" });
    }

    const changePass = await bcrypt.hash(newPass, 10);

    user.password = changePass;
    await user.save();

    return res.status(200).json({ message: "password updated succesfully" });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Something went wrong while updating profile",
    });
  }
};

module.exports = {
  profile,
  updateProfile,
  updatePassword,
};
