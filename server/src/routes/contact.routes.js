import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "لطفاً تمام فیلدهای فرم تماس را وارد کنید.",
      });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "پیام شما با موفقیت ارسال شد.",
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
});

export default router;