import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config(); //helps use .env constants or vars
const PORT = process.env.PORT || 5000;

//creating app
const app = express();

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectMongoDB();
});
