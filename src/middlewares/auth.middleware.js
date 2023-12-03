import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
  try {
    // Get the token from the request cookies
    const { token } = req.cookies;
    // console.log("token > ", token);
    if (!token) {
      return next(new AppError("Unauthorized, please login again", 400));
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (error) {
    // Handle token verification errors
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default isLoggedIn;
