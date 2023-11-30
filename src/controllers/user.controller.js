import emailValidator from "email-validator";
import AppError from "../utils/error.util.js";
import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    //Validating all inputs are exists
    if (!fullName || !email || !password) {
      return next(new AppError("All fields are required, 400"));
    }

    // Validating email
    const validEmail = emailValidator.validate(email);

    if (!validEmail) {
      return next(new AppError("Invalid email, 400"));
    }

    // checking user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("Email already exists", 400));
    }

    // creating user
    const user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url:
          "https://assets-global.website-files.com/619e8d2e8bd4838a9340a810/647c1064ebf1c6171bfd3a87_profile-picture-feature-1.webp",
      },
    });

    // if creating a new user failed
    if (!user) {
      return next(
        new AppError("User registration failed please try again", 400)
      );
    }

    // File upload
    console.log("File Detials > ", req.file);
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          (user.avatar.public_id = result.public_id),
            (user.avatar.secure_url = result.secure_url);

          // Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || "File not uploaded, please try again", 500)
        );
      }
    }

    await user.save();
    user.password = undefined;

    // generating jwt token for automatically login just after when user register
    const token = await user.jwtToken();

    // setting token in  cookies
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Checking these inputs exists
    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    // Getting user info from db
    const user = await User.findOne({ email }).select("+password");

    // Checking user exists or password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Email or password doesn't match"), 400);
    }

    // Generating jwtToken
    const token = await user.jwtToken();
    user.password = undefined;

    // Settig jwtToken in cookies
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // finding user from db by id
    const user = await User.findById(userId);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
