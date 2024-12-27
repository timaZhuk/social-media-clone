import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//Routes import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectMongoDB from "./db/connectMongoDB.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config(); //helps use .env constants or vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

//creating app
const app = express();

app.use(cookieParser()); //we need to parse request and get cookies
//read JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //to parse from data

// --- AUTHENTICATION routes
app.use("/api/auth", authRoutes);
//--USER routes
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectMongoDB();
});
