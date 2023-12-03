import { Router } from "express";
const courseRouter = new Router();
import { getAllCourses, getLecturesByCourseId } from "../controllers/index.js";
import isLoggedIn from "../middlewares/auth.middleware.js";

courseRouter.get("/", getAllCourses);
courseRouter.get("/:id", isLoggedIn, getLecturesByCourseId);

export default courseRouter;
