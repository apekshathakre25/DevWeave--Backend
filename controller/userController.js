const profile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "User profile fetched succesfully",
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

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
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
