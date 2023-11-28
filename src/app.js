const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

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

app.use("/ping", (req, res) => {
  res.send("/pong");
});

app.all("*", (req, res) => {
  res.status(404).send("OOPs!! 404 Page not found! ");
});

module.exports = app;
