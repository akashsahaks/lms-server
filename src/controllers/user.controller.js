import emailValidator from "email-validator";
import AppError from "../utils/error.util.js";
import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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
        // initially putting email as default value so it doesn't throw error becase we are handling file after user creation
        public_id: email,
        secure_url: email,
      },
    });

    // if creating a new user failed
    if (!user) {
      return next(
        new AppError("User registration failed please try again", 400)
      );
    }

    // File upload
    // console.log("File Detials > ", req.file);
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

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("Email is not registered", 400));
  }

  const resetToken = await user.generatePasswordResetToken();
  await user.save();

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // console.log("Reset password url > ", resetPasswordUrl);

  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank"> Reset your password </a> \n If the above link does not work for some reason then copy pasete this link in new tab ${resetPasswordUrl} \n If you have not requested this, kindly ignore. `;

  try {
    await sendEmail(email, subject, message);
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully! `,
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();

    return next(new AppError(error.message, 500));
  }
};

export const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new AppError("Token is invalid or expired, please try again", 400)
      );
    }

    // Update the user's password and clear reset fields
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    console.error("Error during password reset:", error);
    return next(new AppError("Internal Server Error", 500));
  }
};

export const changePassword = async (req, res, next) => {
  const { password, newPassword } = req.body;
  const { id } = req.user;

  if (!password || !newPassword) {
    return next(new AppError("All fields are mandatory", 400));
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError("Invalid old password", 400));
  }

  user.password = newPassword;
  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};

export const updateUser = async (req, res, next) => {
  const { fullName } = req.body;
  const { id } = req.user;
  // console.log(`fullName - ${fullName} , id - ${id}`);

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  if (req.body.fullName) {
    user.fullName = fullName;
    // console.log("user > ", user);
  }
  if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
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

  res.status(200).json({
    success: true,
    message: "User details upload successfully",
    user,
  });
};
