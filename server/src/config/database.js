import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // اجبار به استفاده از IPv4 برای جلوگیری از چالش‌های DNS و روتینگ
    };

    await mongoose.connect(uri, options);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;
