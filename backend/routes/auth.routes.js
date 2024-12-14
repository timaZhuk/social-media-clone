import express from "express";
import { signup, logout, login } from "../controllers/auth.controller.js";

const router = express.Router();

//-------------sigup
router.post("/signup", signup);

//-------------login
router.post("/login", login);

//-------------logout
router.post("/logout", logout);

export default router;
