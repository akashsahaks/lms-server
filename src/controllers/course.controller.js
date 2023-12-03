import { Course } from "../models/index.js";
import AppError from "../utils/error.util.js";

export const getAllCourses = async (req, res, next) => {
  try {
    // getting all courses not lectures which are in courses, that's why "-lectures" for skip this
    const courses = await Course.find({}).select("-lectures");

    res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getLecturesByCourseId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("Invalid course id or not found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Coursee lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
