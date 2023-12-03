import express from "express";
const userRouter = express.Router();

import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
} from "../controllers/index.js";

import isLoggedIn from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

userRouter.post("/register", upload.single("avatar"), register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/me", isLoggedIn, getProfile);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:resetToken", resetPassword);
userRouter.post("/change-password", isLoggedIn, changePassword);
userRouter.patch("/update", isLoggedIn, upload.single("avatar"), updateUser);

export default userRouter;
