import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
  // getting token from cookies if exists
  const { token } = req.cookies;
  if (!token) {
    return next(new AppError("Unauthorized, please login again", 400));
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = userDetails;
  next();
};

export default isLoggedIn;
