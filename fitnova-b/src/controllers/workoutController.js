import Workout from "../models/Workout.js";

// SAVE WORKOUT
export const saveWorkout = async (req, res) => {
  try {
    const { exercises, duration } = req.body;

    // TOTAL VOLUME
    let totalVolume = 0;

    exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        totalVolume += set.weight * set.reps;
      });
    });

    // SIMPLE CALORIE ESTIMATION
    const caloriesBurned = Math.floor(duration * 5);

    for (const exercise of exercises) {
      for (const set of exercise.sets) {
        const previousPR = await Workout.findOne({
          user: req.user._id,

          "exercises.name": exercise.name,
        }).sort({
          totalVolume: -1,
        });

        if (!previousPR || set.weight > previousPR.totalVolume) {
          set.isPR = true;
        }
      }
    }

    const workout = await Workout.create({
      user: req.user._id,

      exercises,

      duration,

      caloriesBurned,

      totalVolume,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER WORKOUTS
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DAILY ANALYTICS
export const getAnalytics = async (req, res) => {
  try {
    const workouts = await Workout.find({
      user: req.user._id,
    });

    // TOTAL WORKOUTS
    const totalWorkouts = workouts.length;

    // TOTAL CALORIES
    const totalCalories = workouts.reduce(
      (acc, workout) => acc + workout.caloriesBurned,
      0,
    );

    // TOTAL VOLUME
    const totalVolume = workouts.reduce(
      (acc, workout) => acc + workout.totalVolume,
      0,
    );

    // STREAK SYSTEM
    let streak = 0;

    const dates = workouts.map((w) => new Date(w.createdAt).toDateString());

    const uniqueDates = [...new Set(dates)];

    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    let currentDate = new Date();

    for (let i = 0; i < uniqueDates.length; i++) {
      const workoutDate = new Date(uniqueDates[i]);

      const diffDays = Math.floor(
        (currentDate - workoutDate) / (1000 * 60 * 60 * 24),
      );

      if (diffDays <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    res.status(200).json({
      totalWorkouts,

      totalCalories,

      totalVolume,

      streak,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
