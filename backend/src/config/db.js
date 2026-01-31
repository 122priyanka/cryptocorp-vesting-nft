const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    console.error("Missing MongoDB config. Set MONGO_URI in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
