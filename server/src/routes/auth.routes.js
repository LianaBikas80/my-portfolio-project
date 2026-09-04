import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResetCodeEmail } from "../utils/emailService.js";

const router = express.Router();

// 1. مسیر ثبت‌نام کاربر (Register)
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // بررسی پر بودن تمام فیلدها
    if (!name || !email || !password) {
      return res.status(400).json({ message: "لطفاً تمامی فیلدها را وارد کنید." });
    }

    // بررسی تکراری نبودن ایمیل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت‌نام کرده است." });
    }

    // هش کردن رمز عبور (غیرقابل بازگشت)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ساخت و ذخیره کاربر جدید در دیتابیس
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // تولید توکن احراز هویت
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ارسال پاسخ موفق به همراه توکن و مشخصات کاربر (بدون پسورد)
    res.status(201).json({
      message: "ثبت‌نام با موفقیت انجام شد.",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 2. مسیر ورود کاربر (Login)
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // بررسی پر بودن فیلدها
    if (!email || !password) {
      return res.status(400).json({ message: "لطفاً ایمیل و رمز عبور را وارد کنید." });
    }

    // پیدا کردن کاربر با ایمیل
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "ایمیل یا رمز عبور اشتباه است." });
    }

    // مقایسه رمز عبور ورودی با پسورد هش‌شده داخل دیتابیس
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "ایمیل یا رمز عبور اشتباه است." });
    }

    // تولید توکن در صورت صحت رمز عبور
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "ورود با موفقیت انجام شد.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. درخواست ارسال کد بازیابی رمز (Forgot Password)
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    // بررسی وارد شدن ایمیل
    if (!email) {
      return res.status(400).json({ message: "لطفاً ایمیل خود را وارد کنید." });
    }

    // جستجوی کاربر در دیتابیس
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "کاربری با این ایمیل یافت نشد." });
    }

    // تولید کد تصادفی ۶ رقمی
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ذخیره کد و انقضای ۱۰ دقیقه‌ای در دیتابیس
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // ارسال ایمیل حاوی کد ۶ رقمی
    await sendResetCodeEmail(user.email, resetCode);

    res.status(200).json({
      message: "کد تأیید به ایمیل شما ارسال شد.",
    });
  } catch (error) {
    next(error);
  }
});
// 3.5. اعتبارسنجی اولیه کد بازیابی رمز (Verify Reset Code)
router.post("/verify-reset-code", async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "لطفاً ایمیل و کد تأیید را وارد کنید." });
    }

    // بررسی تطابق ایمیل، کد صحیح و تاریخ انقضا
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "کد واردشده اشتباه است یا منقضی شده است." });
    }

    res.status(200).json({
      message: "کد تأیید صحیح است.",
    });
  } catch (error) {
    next(error);
  }
});

// 4. اعتبارسنجی کد و تغییر رمز عبور (Reset Password)
router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    // بررسی پر بودن همه فیلدها
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "لطفاً ایمیل، کد تأیید و رمز جدید را وارد کنید." });
    }

    // بررسی حداقل طول پسورد جدید
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "رمز عبور باید حداقل ۶ کاراکتر باشد." });
    }

    // پیدا کردن کاربر با تطابق ایمیل، کد صحیح و تاریخ انقضای معتبر
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: new Date() }, // انقضا هنوز نرسیده باشد
    });

    if (!user) {
      return res.status(400).json({ message: "کد واردشده اشتباه است یا منقضی شده است." });
    }

    // هش کردن رمز عبور جدید
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // به‌روزرسانی رمز و پاک کردن کد بازیابی
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      message: "رمز عبور با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;