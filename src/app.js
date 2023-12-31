import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware.js";

// importing routes
import { courseRouter, userRouter } from "./routes/index.js";

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

// Logging request
app.use(morgan("dev"));

app.use("/ping", (req, res) => {
  res.send("Pong");
});

// user routes
app.use("/api/v1/user", userRouter);

// course routes
app.use("/api/v1/course", courseRouter);

app.all("*", (req, res) => {
  res.status(404).send("OOPs!! 404 Page not found! ");
});

// Error middlware handles all error
app.use(errorMiddleware);

export default app;
