import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام الزامی است."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "ایمیل الزامی است."],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, "موضوع پیام الزامی است."],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "متن پیام الزامی است."],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // خودکار فیلدهای createdAt و updatedAt را اضافه می‌کند
  }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;