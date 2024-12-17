import jwt from "jsonwebtoken";
export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  //send token as cookies
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //in milli seconds
    httpOnly: true, //prevent XSS attaks cross-site scripting attacks
    sameSite: "strict", //"strict"
    secure: process.env.NODE_ENV !== "development",
  });
};
