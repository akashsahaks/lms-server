import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
} from "./user.controller.js";

import { getAllCourses, getLecturesByCourseId } from "./course.controller.js";

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
  getAllCourses,
  getLecturesByCourseId,
};
