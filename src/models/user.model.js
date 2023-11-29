import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      minLength: [5, "Name must be at least 5 characters"],
      maxLength: [50, "Name should be less than 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      lowercase: true,
      unique: [true, "Email already exists"],
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Provide valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

// hashing password before saving into db
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// creating methods to generating token
userSchema.methods = {
  jwtToken: async function () {
    return await jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  },
};
const User = model("user", userSchema);

export default User;
