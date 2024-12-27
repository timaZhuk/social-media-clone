import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

//SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    //-CHECK--check email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      //400-errors in fields
      return res.status(400).json({ error: "Invalid email format" });
    }
    //-CHECK-check out User has already exist
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    //-CHECK-check out Email existance (it has been created before)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already exist (taken)" });
    }

    //-CHECK-check out password's length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // HASH hash password
    //convert password to something like this FYGf45!UYhjgjhbds4654dsfr##54
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    //-----------new User object-----
    const newUser = new User({
      fullName: fullName,
      username: username,
      email: email,
      password: hashPassword,
    });
    //---CHECK AND SAVE------check out new User------------------
    if (newUser) {
      //function generate Token and Cookies
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      //return newUser
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    } //if-else end
  } catch (error) {
    res.status(400).json({ error: "Internal Server Error" });
  }
};

//-----LOGIN
export const login = async (req, res) => {
  try {
    //login POST request
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    //check out if password is coincideced and if it is not empty string
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    // generate Token
    generateTokenAndSetCookie(user._id, res);

    //send response body
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//---LOGOUT
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "Logged out!!!",
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//---GET ME------------

//---GetMe for checking out whether user is authenticated or not
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
