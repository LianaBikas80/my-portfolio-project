import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

export default healthRouter;