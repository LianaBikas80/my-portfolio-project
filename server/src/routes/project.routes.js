import express from "express";
import Project from "../models/Project.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js"; // اطمینان حاصل کنید این فایل middleware وجود دارد

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({});
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "پروژه‌ای با این شناسه یافت نشد." });
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, image, category, technologies, githubUrl, demoUrl } = req.body;

    // Basic validation
    if (!title || !description || !image || !category || !technologies) {
        return res.status(400).json({ message: "لطفاً تمام فیلدهای الزامی را پر کنید." });
    }

    const newProject = await Project.create({
      title,
      description,
      image,
      category,
      technologies,
      githubUrl: githubUrl || "", // Optional fields
      demoUrl: demoUrl || "",
    });

    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, image, category, technologies, githubUrl, demoUrl } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "پروژه‌ای با این شناسه یافت نشد." });
    }

    // Basic validation
    if (!title || !description || !image || !category || !technologies) {
        return res.status(400).json({ message: "لطفاً تمام فیلدهای الزامی را پر کنید." });
    }

    project.title = title;
    project.description = description;
    project.image = image;
    project.category = category;
    project.technologies = technologies;
    project.githubUrl = githubUrl || project.githubUrl;
    project.demoUrl = demoUrl || project.demoUrl;

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "پروژه‌ای با این شناسه یافت نشد." });
    }

    await project.deleteOne(); // Use deleteOne() which is the modern way
    res.status(200).json({ message: "پروژه با موفقیت حذف شد.", id: req.params.id });
  } catch (error) {
    next(error);
  }
});

export default router;