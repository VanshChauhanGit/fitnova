import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection on serverless environments (e.g. Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("FitNova API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);

export default app;
