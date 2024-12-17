import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// next - is parameter for "next" function getMe router.get("/me", protectRoute, getMe);
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log(req.cookies);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid Token, not decoded" });
    }
    // retrieve user.id without "password" word
    const user = await User.findById(decode.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // pass out the user obj to the request
    req.user = user;
    next();
    //try end
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
