import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connections[0].readyState === 1) {
    isConnected = true;
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI environment variable is missing!");
    throw new Error("MONGO_URI environment variable is not defined");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
