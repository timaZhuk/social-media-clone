import express from "express";
import {
  signup,
  logout,
  login,
  getMe,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
//import cookieParser from "cookie-parser";

const router = express.Router();

//-------getMe, we add midddleware "protectRoute"
router.get("/me", protectRoute, getMe);

//-------------sigup
router.post("/signup", signup);

//-------------login
router.post("/login", login);

//-------------logout
router.post("/logout", logout);

//----------------

export default router;
