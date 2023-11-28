require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = require("../src/app.js");
const connectDB = require("../config/dbConfig.js");

// Connecting DB
connectDB();

// Middleware to parse JSON data in the request body
app.use(express.json());
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
// Use cookie-parser middleware
app.use(cookieParser());
// Enable CORS for these permitted origin routes
app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true,
    })
);

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
