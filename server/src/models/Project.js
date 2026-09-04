import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان پروژه الزامی است"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "توضیحات پروژه الزامی است"],
    },
    image: {
      type: String, // URL to the image
      required: [true, "آدرس تصویر پروژه الزامی است"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "دسته بندی پروژه الزامی است"],
      trim: true,
    },
    technologies: {
      type: [String], // Array of strings for technologies used
      required: [true, "فناوری‌های استفاده شده الزامی است"],
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    demoUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;