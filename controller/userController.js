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

    const allowedFields = ["skills", "about", "profilePicture", "gender"];

    const isValidUpdate = Object.keys(req.body).every((key) =>
      allowedFields.includes(key),
    );

    if (!isValidUpdate) {
      return res.status(400).json({
        message:
          "Only skills, about, profilePicture, and gender can be updated",
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

module.exports = {
  profile,
  updateProfile
};
