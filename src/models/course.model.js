import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      minLength: [2, "Title must be at least 2 characters"],
      maxLength: [50, "Title should be less than 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
      minLength: [5, "Description must be at least 5 characters"],
      maxLength: [300, "Description should be less than 300 characters"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    lectures: [
      {
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Course = model("course", courseSchema);

export default Course;
