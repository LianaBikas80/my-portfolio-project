import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import healthRouter from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import projectRoutes from "./routes/project.routes.js";
import messageRoutes from "./routes/message.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// اصلاح مسیر: از src به server و بعد به ریشه پروژه
const rootDir = path.resolve(__dirname, "../../");

const app = express();

// اصلاح CORS: هم لوکال و هم دامنه اصلی خودت را اجازه بده
app.use(
  cors({
    origin: ["http://localhost:5173", "https://liana-portfolio.ir"],
    credentials: true
  }),
);

app.use(express.json());

// ۱. ابتدا مسیرهای API را تعریف می‌کنیم
app.use("/api/health", healthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);

// ۲. سرو کردن فایل‌های استاتیک (CSS, JS, Images) از پوشه dist
app.use(express.static(path.join(rootDir, "dist")));

// ۳. مدیریت مسیرهای SPA: هر مسیری که با /api شروع نشود، index.html را برگرداند
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next(); // اگر مسیر API بود و پیدا نشد، برود سراغ notFoundMiddleware
  }
  // ارسال فایل index.html برای تمام مسیرهای فرانت‌اند
  res.sendFile(path.join(rootDir, "dist", "index.html"));
});

// ۴. در نهایت Middlewareهای خطا
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
