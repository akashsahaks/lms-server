import express from "express";
const userRouter = express.Router();
import { register, login, logout, getProfile } from "../controllers/index.js";

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/me", getProfile);

export default userRouter;
