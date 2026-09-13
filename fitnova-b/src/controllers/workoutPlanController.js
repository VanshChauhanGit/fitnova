import WorkoutPlan from "../models/WorkoutPlan.js";

// @desc    Create a new workout plan
// @route   POST /api/workout-plans
// @access  Private
export const createWorkoutPlan = async (req, res) => {
  try {
    const { name, description, goal, splitDays, isActive, days } = req.body;

    if (!name || !days || days.length === 0) {
      return res.status(400).json({ message: "Plan name and days are required." });
    }

    // If marked active, deactivate existing plans for user
    if (isActive) {
      await WorkoutPlan.updateMany({ user: req.user._id }, { isActive: false });
    }

    // Check if user has no other active plan, if so set this as active
    const activeCount = await WorkoutPlan.countDocuments({ user: req.user._id, isActive: true });
    const shouldBeActive = isActive || activeCount === 0;

    const plan = await WorkoutPlan.create({
      user: req.user._id,
      name,
      description: description || "",
      goal: goal || "Build Muscle",
      splitDays: splitDays || days.length,
      isActive: shouldBeActive,
      days,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workout plans for logged-in user
// @route   GET /api/workout-plans
// @access  Private
export const getWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active workout plan
// @route   GET /api/workout-plans/active
// @access  Private
export const getActiveWorkoutPlan = async (req, res) => {
  try {
    let activePlan = await WorkoutPlan.findOne({ user: req.user._id, isActive: true });

    if (!activePlan) {
      // Fallback to most recent plan if no plan is explicitly active
      activePlan = await WorkoutPlan.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    }

    res.status(200).json(activePlan || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a workout plan
// @route   PUT /api/workout-plans/:id
// @access  Private
export const updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user._id });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    const { name, description, goal, splitDays, isActive, days } = req.body;

    if (isActive && !plan.isActive) {
      await WorkoutPlan.updateMany({ user: req.user._id }, { isActive: false });
    }

    plan.name = name ?? plan.name;
    plan.description = description ?? plan.description;
    plan.goal = goal ?? plan.goal;
    plan.splitDays = splitDays ?? plan.splitDays;
    if (typeof isActive === "boolean") plan.isActive = isActive;
    if (days) plan.days = days;

    const updatedPlan = await plan.save();
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a workout plan
// @route   DELETE /api/workout-plans/:id
// @access  Private
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    // If deleted plan was active, set another remaining plan as active if available
    if (plan.isActive) {
      const remainingPlan = await WorkoutPlan.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
      if (remainingPlan) {
        remainingPlan.isActive = true;
        await remainingPlan.save();
      }
    }

    res.status(200).json({ message: "Workout plan deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set plan as active
// @route   PATCH /api/workout-plans/:id/activate
// @access  Private
export const setActiveWorkoutPlan = async (req, res) => {
  try {
    await WorkoutPlan.updateMany({ user: req.user._id }, { isActive: false });

    const plan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: true },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate all workout plans for user
// @route   PATCH /api/workout-plans/deactivate-all
// @access  Private
export const deactivateAllWorkoutPlans = async (req, res) => {
  try {
    await WorkoutPlan.updateMany({ user: req.user._id }, { isActive: false });
    res.status(200).json({ message: "All workout plans deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log completion of a plan day & advance cycle (or skip session)
// @route   PATCH /api/workout-plans/:id/log-day
// @access  Private
export const logPlanDayCompletion = async (req, res) => {
  try {
    const { dayIndex, workoutId, isSkipped } = req.body;
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user._id });

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    if (isSkipped) {
      plan.lastCompletedDate = new Date();
      plan.lastCompletedIsSkipped = true;
      plan.lastLogDayIndex = dayIndex;
      plan.completedLogs.push({
        dayIndex,
        completedAt: new Date(),
        workoutId: "",
        isSkipped: true,
      });
    } else {
      plan.lastCompletedDayIndex = dayIndex;
      plan.lastCompletedDate = new Date();
      plan.lastCompletedIsSkipped = false;
      plan.lastLogDayIndex = dayIndex;
      plan.completedLogs.push({
        dayIndex,
        completedAt: new Date(),
        workoutId: workoutId || "",
        isSkipped: false,
      });
    }

    const updatedPlan = await plan.save();
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
