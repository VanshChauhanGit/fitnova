import User from "../models/User.js";

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      age,
      gender,
      height,
      weight,
      goals,
      activityLevel,
      profileImage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Username check
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username already taken",
        });
      }
    }

    // VALIDATIONS
    if (age <= 13 || age >= 100) {
      return res.status(400).json({
        message: "Invalid age",
      });
    }

    if (height <= 100 || height >= 250) {
      return res.status(400).json({
        message: "Invalid height",
      });
    }

    if (weight <= 30 || weight >= 250) {
      return res.status(400).json({
        message: "Invalid weight",
      });
    }

    if (!goals || goals.length === 0) {
      return res.status(400).json({
        message: "Select at least 1 goal",
      });
    }

    if (goals.length > 2) {
      return res.status(400).json({
        message: "Maximum 2 goals allowed",
      });
    }

    // UPDATE USER
    user.name = name;
    user.username = username;
    user.age = age;
    user.gender = gender;
    user.height = height;
    user.weight = weight;
    user.goals = goals;
    user.activityLevel = activityLevel;

    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
