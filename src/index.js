import { config } from "dotenv";
config();
const PORT = process.env.PORT || 5000;
import express from "express";
import app from "./app.js";
import connectDB from "./config/dbConfig.js";
import cloudinary from "cloudinary";

// Connecting DB
connectDB();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// starting server
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting LMS-Server:", err);
    process.exit(1); // Exit the process if there's an error during startup
  }

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const serverAddress = `${protocol}://localhost:${PORT}`;
  console.log(`LMS-Server is listening on ${serverAddress}`);
});

// Handling server termination
process.on("SIGINT", () => {
  server.close(() => {
    console.log("LMS-Server terminated gracefully");
    process.exit(0);
  });
});
