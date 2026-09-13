import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, default: "" },
  name: { type: String, required: true },
  bodyPart: { type: String, default: "General" },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: "10-12" },
  restTime: { type: Number, default: 60 }, // in seconds
  notes: { type: String, default: "" },
});

const dayPlanSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true }, // 1, 2, 3...
  title: { type: String, required: true }, // e.g. "Push - Chest, Shoulders, Triceps"
  isRestDay: { type: Boolean, default: false },
  targetMuscles: [{ type: String }],
  exercises: [exerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    goal: {
      type: String,
      enum: ["Build Muscle", "Gain Strength", "Fat Loss", "General Fitness"],
      default: "Build Muscle",
    },
    splitDays: { type: Number, default: 6 }, // 4, 6, 7 or custom
    isActive: { type: Boolean, default: false },
    days: [dayPlanSchema],
    lastCompletedDayIndex: { type: Number, default: -1 },
    lastCompletedDate: { type: Date, default: null },
    lastCompletedIsSkipped: { type: Boolean, default: false },
    lastLogDayIndex: { type: Number, default: -1 },
    completedLogs: [
      {
        dayIndex: Number,
        completedAt: { type: Date, default: Date.now },
        workoutId: String,
        isSkipped: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
