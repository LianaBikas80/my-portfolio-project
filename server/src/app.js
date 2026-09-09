import path from "path";
import cors from "cors";
import express from "express";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import healthRouter from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import projectRoutes from "./routes/project.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

// مسیر مستقیم به پوشه dist در ریشه پروژه (/app/dist)
const distPath = path.join(process.cwd(), "dist");

// پیکربندی CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://liana-portfolio.ir",
      "http://liana-portfolio.ir"
    ],
    credentials: true,
  })
);

app.use(express.json());

// ۱. سرو کردن فایل‌های استاتیک فرانت‌اند (CSS, JS, تصاویر)
app.use(express.static(distPath));

// ۲. مسیرهای API
app.use("/api/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);

// ۳. مدیریت مسیرهای فرانت‌اند (SPA Routing)
app.get("*", (req, res, next) => {
  // اگر درخواست مربوط به API بود و تعریف نشده بود، به میدلور 404 برود
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  // در غیر این صورت فایل index.html فرانت‌اند تحویل داده شود
  res.sendFile(path.join(distPath, "index.html"));
});

// ۴. مدیریت خطاهای 404 و خطاهای عمومی سرور برای APIها
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
