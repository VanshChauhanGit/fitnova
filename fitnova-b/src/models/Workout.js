import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  reps: Number,

  weight: Number,

  restPause: {
    type: Boolean,
    default: false,
  },

  isPR: {
    type: Boolean,
    default: false,
  },
});

const exerciseSchema = new mongoose.Schema({
  exerciseId: String,

  name: String,

  bodyPart: String,

  gifUrl: String,

  notes: String,

  supersetGroup: Number,

  sets: [setSchema],
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    workoutName: String,

    notes: String,

    exercises: [exerciseSchema],

    duration: Number,

    caloriesBurned: Number,

    totalVolume: Number,
  },
  {
    timestamps: true,
  },
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;
