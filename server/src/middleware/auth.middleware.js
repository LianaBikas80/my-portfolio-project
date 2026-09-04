import jwt from "jsonwebtoken";
import User from "../models/User.js"; // فرض می‌کنیم مدل User در اینجا موجود است

// Middleware برای محافظت از روت‌ها (بررسی توکن)
export const protect = async (req, res, next) => {
  let token;

  // چک کردن هدر Authorization برای توکن
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // دریافت توکن از هدر
      token = req.headers.authorization.split(" ")[1];

      // تایید توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // دریافت اطلاعات کاربر بر اساس شناسه از توکن (بدون پسورد)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "کاربر یافت نشد." });
      }

      next(); // ادامه پردازش به روت بعدی
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ message: "توکن نامعتبر است." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "شما مجاز به دسترسی نیستید، توکن ارسال نشده است." });
  }
};

// Middleware برای محدود کردن دسترسی به ادمین‌ها
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // اگر کاربر ادمین است، اجازه دسترسی بده
  } else {
    res.status(403).json({ message: "شما مجوز دسترسی ادمین را ندارید." }); // اگر ادمین نیست، خطا 403
  }
};