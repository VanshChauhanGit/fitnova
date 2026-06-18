import express from "express";

import {
  saveWorkout,
  getWorkouts,
  getAnalytics,
} from "../controllers/workoutController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveWorkout);

router.get("/", protect, getWorkouts);

router.get("/analytics", protect, getAnalytics);

export default router;
