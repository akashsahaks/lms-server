import express from "express";
const userRouter = express.Router();
import { register, login, logout, getProfile } from "../controllers/index.js";
import isLoggedIn from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

userRouter.post("/register", upload.single("avatar"), register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/me", isLoggedIn, getProfile);

export default userRouter;
