import express from "express";
import {
  createWorkoutPlan,
  getWorkoutPlans,
  getActiveWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  setActiveWorkoutPlan,
  deactivateAllWorkoutPlans,
  logPlanDayCompletion,
} from "../controllers/workoutPlanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWorkoutPlan);
router.get("/", protect, getWorkoutPlans);
router.get("/active", protect, getActiveWorkoutPlan);
router.patch("/deactivate-all", protect, deactivateAllWorkoutPlans);
router.put("/:id", protect, updateWorkoutPlan);
router.delete("/:id", protect, deleteWorkoutPlan);
router.patch("/:id/activate", protect, setActiveWorkoutPlan);
router.patch("/:id/log-day", protect, logPlanDayCompletion);

export default router;
