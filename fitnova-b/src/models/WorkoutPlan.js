import mongoose from "mongoose";

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    name: String,

    exercises: [
      {
        exerciseId: String,

        name: String,

        target: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
