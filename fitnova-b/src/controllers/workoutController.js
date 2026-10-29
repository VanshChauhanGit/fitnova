import Workout from "../models/Workout.js";

// SAVE WORKOUT
export const saveWorkout = async (req, res) => {
  try {
    const { exercises, duration } = req.body;

    // 1. CALCULATE WORKOUT STATS & EXERCISE TYPES
    let totalVolume = 0;
    let completedSetsCount = 0;
    let cardioSetsCount = 0;
    let strengthSetsCount = 0;

    (exercises || []).forEach((exercise) => {
      const isCardio =
        exercise.bodyPart?.toLowerCase() === 'cardio' ||
        ['cardio', 'run', 'treadmill', 'cycle', 'cycling', 'rowing', 'elliptical', 'stair'].some(
          (k) => exercise.name?.toLowerCase().includes(k)
        );

      (exercise.sets || []).forEach((set) => {
        const isCompleted = set.completed === true || set.completed === undefined;
        if (isCompleted) {
          completedSetsCount++;
          const w = parseFloat(set.weight) || 0;
          const r = parseInt(set.reps, 10) || 0;
          if (isCardio) {
            cardioSetsCount++;
          } else {
            strengthSetsCount++;
            totalVolume += w * r;
          }
        }
      });
    });

    // 2. REALISTIC ACTIVE TIME BOUNDING (Prevents rewarding idle timer time)
    // - Each strength set realistically accounts for ~2.5 minutes (set duration + rest)
    // - Cardio accounts for continuous session time
    const rawDurationMinutes = Math.min(180, Math.max(0, (duration || 0) / 60));

    let effectiveMinutes = 0;
    if (completedSetsCount === 0) {
      effectiveMinutes = 0;
    } else if (strengthSetsCount > 0 && cardioSetsCount === 0) {
      // Pure strength: time credited cannot exceed ~2.5 mins per completed set
      effectiveMinutes = Math.min(rawDurationMinutes, Math.max(1, strengthSetsCount * 2.5));
    } else if (cardioSetsCount > 0 && strengthSetsCount === 0) {
      // Pure cardio: continuous timer duration
      effectiveMinutes = rawDurationMinutes;
    } else {
      // Hybrid (both strength and cardio):
      const strengthTimeCap = strengthSetsCount * 2.5;
      effectiveMinutes = Math.min(rawDurationMinutes, Math.max(1, strengthTimeCap + (rawDurationMinutes * 0.5)));
    }

    // 3. USER BODY WEIGHT (defaults to 70kg if unprovided)
    const userWeight = req.user?.weight && req.user.weight >= 30 ? req.user.weight : 70;

    // 4. MET CALCULATION (Cardio: ~7.5 MET; Strength: ~4.5 MET)
    let met = 4.5;
    if (cardioSetsCount > 0 && strengthSetsCount === 0) {
      met = 7.5;
    } else if (cardioSetsCount > 0 && strengthSetsCount > 0) {
      const cardioRatio = cardioSetsCount / completedSetsCount;
      met = 4.5 * (1 - cardioRatio) + 7.5 * cardioRatio;
    }

    const caloriesPerMinute = (met * 3.5 * userWeight) / 200;
    const baseCalories = caloriesPerMinute * effectiveMinutes;

    // Volume bonus for strength work (0.012 kcal per kg moved, capped at 30% of base)
    const volumeBonus = totalVolume > 0 ? Math.min(baseCalories * 0.3, totalVolume * 0.012) : 0;

    const caloriesBurned = Math.round(baseCalories + volumeBonus);

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
