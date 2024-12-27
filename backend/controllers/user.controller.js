import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

//----------USER PROFILE
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile ", error.message);
    res.status(500).json({ error: error.message });
  }
};

//----------FOLLOW UNFOLLOW

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    //user id we want follow or unfollow
    const userToModify = await User.findById(id);
    //me or yours user profile id
    const currentUser = await User.findById(req.user._id);

    //checking out that you can't follow yourself
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow ypurdelf" });
    }
    //--CHECK --check if we can users exist
    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });
    //--CHECK--check if we follow this user (or not)
    const isFollowing = currentUser.following.include(id);

    if (isFollowing) {
      //--unfollow the user
      // we unfollow ModifiedUser
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      // we delete id of ModifiedUser from  our following array
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      //  //TODO return the id of the user as response
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      //follow the user
      //we add our(currentUser) _id to the 'followers' array of ModifiedUser
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      // we add  ModifiedUser id to the our following array of currentUser
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      //
      // Send follow from us to ModifiedUser notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();

      //TODO return the id of the user as response
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUse ", error.message);
    res.status(500).json({ error: error.message });
  }
};

//------------------------------
//---Suggested users

export const getSuggestedtUsers = async (req, res) => {
  try {
    //extract your information
    const userId = req.user._id;
    //get all user that in following array
    const usersFollowedByMe = await User.findById(userId).select("following");
    //aggregation function for filtering suggested users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      }, //match
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

//--Update User

export const updateUser = async (req, res) => {
  //  -- get these fields for updating
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;
  //get the id of current user
  const userId = req.user._id;
  //  --
  try {
    //reteieve user from DB
    let user = await User.findById(userId);
    //--CHECK
    if (!user) return res.status(400).json({ message: "User not found" });
    // CHECK if newPassword and currentPaswors are existing
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }
    //--if both passwords are enetred
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch)
        return res.status(400).json({ error: "Current possword is incorrect" });
      // length < 6
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      } //check the length if
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } //outer if

    //profile  image
    if (profileImg) {
      if (user.profileImg) {
        // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    //cover image
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    //REASSIGN user data
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    //password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
