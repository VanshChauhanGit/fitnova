import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';

export const PRESET_SPLITS = [
  {
    id: 'preset-ppl-6',
    name: '6-Day Push Pull Legs (PPL)',
    description: 'The ultimate hypertrophy split for maximal muscle building and recovery.',
    goal: 'Build Muscle',
    splitDays: 7,
    isActive: true,
    lastCompletedDayIndex: -1,
    lastCompletedDate: null,
    completedLogs: [],
    days: [
      {
        dayNumber: 1,
        title: 'Push A (Chest Focus)',
        isRestDay: false,
        targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
        exercises: [
          { exerciseId: 'ex-1', name: 'Barbell Bench Press', bodyPart: 'Chest', sets: 4, reps: '8-10', restTime: 90, notes: 'Retract scapula & control weight down' },
          { exerciseId: 'ex-2', name: 'Incline Dumbbell Press', bodyPart: 'Chest', sets: 3, reps: '10-12', restTime: 60, notes: 'Focus on upper chest stretch' },
          { exerciseId: 'ex-3', name: 'Overhead Dumbbell Press', bodyPart: 'Shoulders', sets: 3, reps: '8-10', restTime: 75, notes: 'Keep core tight, no arching back' },
          { exerciseId: 'ex-4', name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 4, reps: '12-15', restTime: 45, notes: 'Slight forward lean, lead with elbows' },
          { exerciseId: 'ex-5', name: 'Triceps Rope Pushdowns', bodyPart: 'Triceps', sets: 3, reps: '12-15', restTime: 45, notes: 'Spread rope at full extension' },
        ],
      },
      {
        dayNumber: 2,
        title: 'Pull A (Back Focus)',
        isRestDay: false,
        targetMuscles: ['Back', 'Biceps', 'Rear Delts'],
        exercises: [
          { exerciseId: 'ex-6', name: 'Barbell Bent Over Row', bodyPart: 'Back', sets: 4, reps: '8-10', restTime: 90, notes: 'Hinge hips, pull to belly button' },
          { exerciseId: 'ex-7', name: 'Lat Pulldowns', bodyPart: 'Back', sets: 3, reps: '10-12', restTime: 60, notes: 'Squeeze lats at bottom' },
          { exerciseId: 'ex-8', name: 'Seated Cable Row', bodyPart: 'Back', sets: 3, reps: '10-12', restTime: 60, notes: 'Drive elbows backward' },
          { exerciseId: 'ex-9', name: 'Face Pulls', bodyPart: 'Rear Delts', sets: 4, reps: '15-20', restTime: 45, notes: 'Pull toward forehead, rotate shoulders' },
          { exerciseId: 'ex-10', name: 'Incline Dumbbell Bicep Curls', bodyPart: 'Biceps', sets: 3, reps: '10-12', restTime: 60, notes: 'Full bicep stretch at bottom' },
        ],
      },
      {
        dayNumber: 3,
        title: 'Legs A (Quads & Calves)',
        isRestDay: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Calves'],
        exercises: [
          { exerciseId: 'ex-11', name: 'Barbell Back Squat', bodyPart: 'Quads', sets: 4, reps: '6-8', restTime: 120, notes: 'Brace core, squat below parallel' },
          { exerciseId: 'ex-12', name: 'Leg Press', bodyPart: 'Quads', sets: 3, reps: '10-12', restTime: 75, notes: 'Controlled eccentric descent' },
          { exerciseId: 'ex-13', name: 'Romanian Deadlift (RDL)', bodyPart: 'Hamstrings', sets: 4, reps: '8-10', restTime: 90, notes: 'Feel deep hamstring stretch' },
          { exerciseId: 'ex-14', name: 'Standing Calf Raises', bodyPart: 'Calves', sets: 4, reps: '15-20', restTime: 45, notes: 'Pause 2s at peak elevation' },
        ],
      },
      {
        dayNumber: 4,
        title: 'Push B (Shoulder Focus)',
        isRestDay: false,
        targetMuscles: ['Shoulders', 'Chest', 'Triceps'],
        exercises: [
          { exerciseId: 'ex-15', name: 'Military Overhead Press', bodyPart: 'Shoulders', sets: 4, reps: '6-8', restTime: 90, notes: 'Strict overhead press, full lock out' },
          { exerciseId: 'ex-16', name: 'Dumbbell Incline Bench Press', bodyPart: 'Chest', sets: 3, reps: '10-12', restTime: 60, notes: 'Deep stretch at bottom' },
          { exerciseId: 'ex-17', name: 'Cable Chest Flyes', bodyPart: 'Chest', sets: 3, reps: '12-15', restTime: 45, notes: 'Peak chest contraction' },
          { exerciseId: 'ex-18', name: 'Skull Crushers', bodyPart: 'Triceps', sets: 3, reps: '10-12', restTime: 60, notes: 'Keep upper arms stationary' },
        ],
      },
      {
        dayNumber: 5,
        title: 'Pull B (Bicep & Lat Width)',
        isRestDay: false,
        targetMuscles: ['Back', 'Biceps', 'Abs'],
        exercises: [
          { exerciseId: 'ex-19', name: 'Weighted Pull-Ups', bodyPart: 'Back', sets: 4, reps: '6-8', restTime: 90, notes: 'Chest to bar, full extension' },
          { exerciseId: 'ex-20', name: 'Single-Arm Dumbbell Row', bodyPart: 'Back', sets: 3, reps: '10-12', restTime: 60, notes: 'Pull to hip pocket' },
          { exerciseId: 'ex-21', name: 'Barbell Bicep Curl', bodyPart: 'Biceps', sets: 4, reps: '8-10', restTime: 60, notes: 'No body momentum' },
          { exerciseId: 'ex-22', name: 'Hammer Curls', bodyPart: 'Biceps', sets: 3, reps: '10-12', restTime: 45, notes: 'Target brachialis & forearms' },
          { exerciseId: 'ex-23', name: 'Hanging Leg Raises', bodyPart: 'Abs', sets: 3, reps: '12-15', restTime: 45, notes: 'Control hip tilt' },
        ],
      },
      {
        dayNumber: 6,
        title: 'Legs B (Hamstrings & Glutes)',
        isRestDay: false,
        targetMuscles: ['Hamstrings', 'Glutes', 'Calves'],
        exercises: [
          { exerciseId: 'ex-24', name: 'Conventional Deadlift', bodyPart: 'Back & Legs', sets: 4, reps: '5', restTime: 120, notes: 'Neutral spine, drive with legs' },
          { exerciseId: 'ex-25', name: 'Walking Lunges', bodyPart: 'Quads & Glutes', sets: 3, reps: '12 per leg', restTime: 60, notes: 'Knee tracking over toes' },
          { exerciseId: 'ex-26', name: 'Lying Leg Curls', bodyPart: 'Hamstrings', sets: 4, reps: '12-15', restTime: 45, notes: 'Squeeze hamstrings at top' },
          { exerciseId: 'ex-27', name: 'Seated Calf Raises', bodyPart: 'Calves', sets: 4, reps: '15-20', restTime: 45, notes: 'Full range of motion' },
        ],
      },
      {
        dayNumber: 7,
        title: 'Active Recovery & Rest',
        isRestDay: true,
        targetMuscles: ['Rest & Mobility'],
        exercises: [],
      },
    ],
  },
  {
    id: 'preset-ul-4',
    name: '4-Day Upper / Lower Split',
    description: 'Balanced 4-day frequency allowing high intensity with optimal recovery days.',
    goal: 'Gain Strength',
    splitDays: 4,
    isActive: false,
    lastCompletedDayIndex: -1,
    lastCompletedDate: null,
    completedLogs: [],
    days: [
      {
        dayNumber: 1,
        title: 'Upper Body Power (A)',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        exercises: [
          { exerciseId: 'ex-1', name: 'Barbell Bench Press', bodyPart: 'Chest', sets: 4, reps: '6-8', restTime: 90, notes: 'Heavy strength effort' },
          { exerciseId: 'ex-6', name: 'Barbell Bent Over Row', bodyPart: 'Back', sets: 4, reps: '6-8', restTime: 90, notes: 'Solid torso angle' },
          { exerciseId: 'ex-3', name: 'Overhead Dumbbell Press', bodyPart: 'Shoulders', sets: 3, reps: '8-10', restTime: 60, notes: 'Controlled reps' },
          { exerciseId: 'ex-21', name: 'Barbell Bicep Curl', bodyPart: 'Biceps', sets: 3, reps: '10-12', restTime: 45, notes: 'Strict form' },
        ],
      },
      {
        dayNumber: 2,
        title: 'Lower Body Power (A)',
        isRestDay: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Calves'],
        exercises: [
          { exerciseId: 'ex-11', name: 'Barbell Back Squat', bodyPart: 'Quads', sets: 4, reps: '6-8', restTime: 120, notes: 'Deep squatting depth' },
          { exerciseId: 'ex-13', name: 'Romanian Deadlift', bodyPart: 'Hamstrings', sets: 4, reps: '8-10', restTime: 90, notes: 'Strong hip hinge' },
          { exerciseId: 'ex-12', name: 'Leg Extension', bodyPart: 'Quads', sets: 3, reps: '12-15', restTime: 60, notes: 'Quad peak isolation' },
          { exerciseId: 'ex-14', name: 'Standing Calf Raises', bodyPart: 'Calves', sets: 4, reps: '15', restTime: 45, notes: 'Pause stretch' },
        ],
      },
      {
        dayNumber: 3,
        title: 'Upper Body Hypertrophy (B)',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Triceps'],
        exercises: [
          { exerciseId: 'ex-2', name: 'Incline Dumbbell Press', bodyPart: 'Chest', sets: 4, reps: '10-12', restTime: 60, notes: 'Upper chest focus' },
          { exerciseId: 'ex-7', name: 'Lat Pulldowns', bodyPart: 'Back', sets: 4, reps: '10-12', restTime: 60, notes: 'Wide grip pulldowns' },
          { exerciseId: 'ex-4', name: 'Lateral Raises', bodyPart: 'Shoulders', sets: 4, reps: '15', restTime: 45, notes: 'Continuous tension' },
          { exerciseId: 'ex-5', name: 'Triceps Rope Pushdowns', bodyPart: 'Triceps', sets: 3, reps: '12-15', restTime: 45, notes: 'Lockout contraction' },
        ],
      },
      {
        dayNumber: 4,
        title: 'Lower Body Hypertrophy (B)',
        isRestDay: false,
        targetMuscles: ['Hamstrings', 'Quads', 'Glutes', 'Abs'],
        exercises: [
          { exerciseId: 'ex-24', name: 'Conventional Deadlift', bodyPart: 'Back & Legs', sets: 3, reps: '6-8', restTime: 120, notes: 'Explosive drive' },
          { exerciseId: 'ex-12', name: 'Leg Press', bodyPart: 'Quads', sets: 4, reps: '12-15', restTime: 75, notes: 'Consistent tempo' },
          { exerciseId: 'ex-26', name: 'Lying Leg Curls', bodyPart: 'Hamstrings', sets: 4, reps: '12-15', restTime: 45, notes: 'Full squeeze' },
          { exerciseId: 'ex-23', name: 'Hanging Leg Raises', bodyPart: 'Abs', sets: 3, reps: '15', restTime: 45, notes: 'Core stability' },
        ],
      },
    ],
  },
];

const STORAGE_KEY = '@fitnova_workout_plans_v2';
const ACTIVE_ID_KEY = '@fitnova_active_plan_id';

const useWorkoutPlanStore = create((set, get) => ({
  plans: [],
  activePlan: null,
  loading: false,
  error: null,

  // INIT & LOAD PLANS (API first, local storage fallback)
  loadPlans: async () => {
    set({ loading: true });
    try {
      const token = await AsyncStorage.getItem('token');
      let loadedFromApi = false;

      // 1. Try fetching from backend API first if logged in
      if (token) {
        try {
          const res = await API.get('/workout-plans', {
            headers: { Authorization: `Bearer ${token}` },
          });

          const rawApiPlans = (res.data || []).map((p) => ({
            ...p,
            id: p._id || p.id,
          }));

          if (rawApiPlans.length > 0) {
            const activeIdx = rawApiPlans.findIndex((p) => p.isActive);
            const targetActiveIdx = activeIdx >= 0 ? activeIdx : 0;

            const apiPlans = rawApiPlans.map((p, idx) => ({
              ...p,
              isActive: idx === targetActiveIdx,
            }));

            const active = apiPlans[targetActiveIdx];
            set({ plans: apiPlans, activePlan: active });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apiPlans));
            if (active) await AsyncStorage.setItem(ACTIVE_ID_KEY, active.id || active._id);
            loadedFromApi = true;
          } else {
            set({ plans: [], activePlan: null });
            loadedFromApi = true;
          }
        } catch (_apiErr) {
          // Backend API unreachable or offline, fall back to local storage
        }
      }

      // 2. Fall back to local storage only if offline or API fetch skipped
      if (!loadedFromApi) {
        const storedPlansJson = await AsyncStorage.getItem(STORAGE_KEY);
        const storedActiveId = await AsyncStorage.getItem(ACTIVE_ID_KEY);

        let localPlans = [];
        if (storedPlansJson) {
          localPlans = JSON.parse(storedPlansJson);
        }

        if (localPlans && localPlans.length > 0) {
          const activeIdx = localPlans.findIndex((p) => p.isActive || p.id === storedActiveId);
          const targetActiveIdx = activeIdx >= 0 ? activeIdx : 0;

          const sanitizedLocal = localPlans.map((p, idx) => ({
            ...p,
            isActive: idx === targetActiveIdx,
          }));

          const active = sanitizedLocal[targetActiveIdx];
          set({ plans: sanitizedLocal, activePlan: active });
        } else {
          set({ plans: [], activePlan: null });
        }
      }
    } catch (err) {
      console.log('Error loading workout plans:', err);
    } finally {
      set({ loading: false });
    }
  },

  // GET TODAY'S DYNAMIC MAPPED SESSION (Smart Catch-Up Engine)
  getTodayMappedSession: () => {
    const activePlan = get().activePlan;
    if (!activePlan || !activePlan.days || activePlan.days.length === 0) {
      return null;
    }

    const totalDays = activePlan.days.length;
    const lastCompletedDayIndex = typeof activePlan.lastCompletedDayIndex === 'number' ? activePlan.lastCompletedDayIndex : -1;
    const lastCompletedDateStr = activePlan.lastCompletedDate;

    let targetDayIndex = (lastCompletedDayIndex + 1) % totalDays;
    let isRolledOver = false;
    let daysSinceLast = 0;

    if (lastCompletedDateStr) {
      const lastDate = new Date(lastCompletedDateStr);
      const today = new Date();
      
      // Reset time portion for accurate date diff
      lastDate.setHours(0, 0, 0, 0);
      const todayZero = new Date(today);
      todayZero.setHours(0, 0, 0, 0);

      const diffMs = todayZero.getTime() - lastDate.getTime();
      daysSinceLast = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // If last completed was yesterday (daysSinceLast === 1), user is on schedule.
      // If daysSinceLast > 1 (e.g. 2+ days without logging), the engine AUTO-MAPS today to targetDayIndex!
      if (daysSinceLast > 1) {
        isRolledOver = true;
      }
    }

    const mappedDay = activePlan.days[targetDayIndex];

    return {
      planId: activePlan.id || activePlan._id,
      planName: activePlan.name,
      splitDays: activePlan.splitDays || totalDays,
      dayIndex: targetDayIndex,
      dayNumber: mappedDay?.dayNumber || targetDayIndex + 1,
      dayTitle: mappedDay?.title || `Day ${targetDayIndex + 1}`,
      isRestDay: mappedDay?.isRestDay || false,
      targetMuscles: mappedDay?.targetMuscles || [],
      exercises: mappedDay?.exercises || [],
      isRolledOver,
      daysSinceLast,
      statusLabel: isRolledOver
        ? `⚡ Rolled over (${daysSinceLast - 1} unlogged day${daysSinceLast > 2 ? 's' : ''} auto-caught up)`
        : lastCompletedDayIndex >= 0
        ? `✓ On Schedule (Cycle Day ${targetDayIndex + 1}/${totalDays})`
        : `🚀 Ready to start (Day 1/${totalDays})`,
    };
  },

  // CREATE A NEW WORKOUT PLAN
  createPlan: async (newPlanData) => {
    set({ loading: true });
    try {
      const planId = 'plan-' + Date.now();
      const planObj = {
        id: planId,
        name: newPlanData.name,
        description: newPlanData.description || '',
        goal: newPlanData.goal || 'Build Muscle',
        splitDays: newPlanData.days ? newPlanData.days.length : 6,
        isActive: !!newPlanData.isActive,
        lastCompletedDayIndex: -1,
        lastCompletedDate: null,
        completedLogs: [],
        days: newPlanData.days || [],
        createdAt: new Date().toISOString(),
      };

      const currentPlans = get().plans;
      let updatedPlans = [planObj, ...currentPlans];

      if (planObj.isActive) {
        updatedPlans = updatedPlans.map((p) => ({
          ...p,
          isActive: p.id === planId,
        }));
      }

      const activePlan = updatedPlans.find((p) => p.isActive) || updatedPlans[0];

      set({ plans: updatedPlans, activePlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      await AsyncStorage.setItem(ACTIVE_ID_KEY, activePlan.id);

      // Backend API call
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const res = await API.post('/workout-plans', planObj, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data) {
            const apiPlan = { ...res.data, id: res.data._id || res.data.id };
            const syncedPlans = updatedPlans.map((p) => (p.id === planId ? apiPlan : p));
            set({ plans: syncedPlans, activePlan: apiPlan.isActive ? apiPlan : activePlan });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedPlans));
          }
        } catch (e) {
          console.log('API sync warning (create):', e.message);
        }
      }

      return { success: true, plan: planObj };
    } catch (err) {
      set({ error: err.message });
      return { success: false, message: err.message };
    } finally {
      set({ loading: false });
    }
  },

  // UPDATE WORKOUT PLAN
  updatePlan: async (planId, updatedFields) => {
    set({ loading: true });
    try {
      const currentPlans = get().plans;
      let updatedPlans = currentPlans.map((p) => {
        if (p.id === planId || p._id === planId) {
          return {
            ...p,
            ...updatedFields,
            splitDays: updatedFields.days ? updatedFields.days.length : p.splitDays,
          };
        }
        return p;
      });

      if (updatedFields.isActive) {
        updatedPlans = updatedPlans.map((p) => ({
          ...p,
          isActive: p.id === planId || p._id === planId,
        }));
      }

      const activePlan = updatedPlans.find((p) => p.isActive) || updatedPlans[0];

      set({ plans: updatedPlans, activePlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      await AsyncStorage.setItem(ACTIVE_ID_KEY, activePlan.id || activePlan._id);

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.put(`/workout-plans/${planId}`, updatedFields, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.log('API sync warning (update):', e.message);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      set({ loading: false });
    }
  },

  // DELETE WORKOUT PLAN
  deletePlan: async (planId) => {
    try {
      const currentPlans = get().plans;
      const filtered = currentPlans.filter((p) => p.id !== planId && p._id !== planId);

      if (filtered.length === 0) {
        return { success: false, message: 'Cannot delete the last remaining workout plan.' };
      }

      let activePlan = get().activePlan;
      if (activePlan?.id === planId || activePlan?._id === planId) {
        filtered[0].isActive = true;
        activePlan = filtered[0];
      }

      set({ plans: filtered, activePlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      await AsyncStorage.setItem(ACTIVE_ID_KEY, activePlan.id || activePlan._id);

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.delete(`/workout-plans/${planId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.log('API sync warning (delete):', e.message);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // SET ACTIVE PLAN
  setActivePlan: async (planId) => {
    try {
      const currentPlans = get().plans;
      const updatedPlans = currentPlans.map((p) => ({
        ...p,
        isActive: p.id === planId || p._id === planId,
      }));

      const activePlan = updatedPlans.find((p) => p.isActive) || null;

      set({ plans: updatedPlans, activePlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      if (activePlan) {
        await AsyncStorage.setItem(ACTIVE_ID_KEY, activePlan.id || activePlan._id);
      }

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.patch(`/workout-plans/${planId}/activate`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.log('API sync warning (activate):', e.message);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // TOGGLE ACTIVE PLAN (Activate or Deactivate plan)
  toggleActivePlan: async (planId) => {
    try {
      const currentPlans = get().plans;
      const targetPlan = currentPlans.find((p) => p.id === planId || p._id === planId);
      const isCurrentlyActive = !!targetPlan?.isActive;

      let updatedPlans = [];
      let activePlan = null;

      if (isCurrentlyActive) {
        // Deactivate all plans
        updatedPlans = currentPlans.map((p) => ({ ...p, isActive: false }));
        activePlan = null;
        await AsyncStorage.removeItem(ACTIVE_ID_KEY);
      } else {
        // Activate selected plan only
        updatedPlans = currentPlans.map((p) => ({
          ...p,
          isActive: p.id === planId || p._id === planId,
        }));
        activePlan = updatedPlans.find((p) => p.isActive) || null;
        if (activePlan) {
          await AsyncStorage.setItem(ACTIVE_ID_KEY, activePlan.id || activePlan._id);
        }
      }

      set({ plans: updatedPlans, activePlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          if (isCurrentlyActive) {
            await API.patch('/workout-plans/deactivate-all', {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            await API.patch(`/workout-plans/${planId}/activate`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch (e) {
          console.log('API sync warning (toggle-active):', e.message);
        }
      }

      return { success: true, isActive: !isCurrentlyActive };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // DEACTIVATE ALL PLANS
  deactivateAllPlans: async () => {
    try {
      const currentPlans = get().plans;
      const updatedPlans = currentPlans.map((p) => ({ ...p, isActive: false }));

      set({ plans: updatedPlans, activePlan: null });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      await AsyncStorage.removeItem(ACTIVE_ID_KEY);

      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.patch('/workout-plans/deactivate-all', {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (e) {
          console.log('API sync warning (deactivate-all):', e.message);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // MARK DAY AS COMPLETED / ADVANCE CYCLE
  markDayComplete: async (dayIndex, workoutId = null) => {
    try {
      const activePlan = get().activePlan;
      if (!activePlan) return;

      const planId = activePlan.id || activePlan._id;
      const updatedDate = new Date().toISOString();
      const logs = activePlan.completedLogs || [];
      const newLogs = [...logs, { dayIndex, completedAt: updatedDate, workoutId }];

      const updatedPlan = {
        ...activePlan,
        lastCompletedDayIndex: dayIndex,
        lastCompletedDate: updatedDate,
        completedLogs: newLogs,
      };

      const updatedPlans = get().plans.map((p) => (p.id === planId || p._id === planId ? updatedPlan : p));

      set({ plans: updatedPlans, activePlan: updatedPlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.patch(
            `/workout-plans/${planId}/log-day`,
            { dayIndex, workoutId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          console.log('API sync warning (log-day):', e.message);
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // SKIP TODAY'S SESSION (ADVANCE CYCLE WITHOUT LOGGING WORKOUT)
  skipTodaySession: async () => {
    try {
      const activePlan = get().activePlan;
      if (!activePlan) return { success: false, message: 'No active plan found' };

      const todaySession = get().getTodayMappedSession();
      if (!todaySession) return { success: false, message: 'No today session mapped' };

      const dayIndex = todaySession.dayIndex;
      const planId = activePlan.id || activePlan._id;
      const updatedDate = new Date().toISOString();
      const logs = activePlan.completedLogs || [];
      const newLogs = [...logs, { dayIndex, completedAt: updatedDate, isSkipped: true }];

      const updatedPlan = {
        ...activePlan,
        lastCompletedDayIndex: dayIndex,
        lastCompletedDate: updatedDate,
        completedLogs: newLogs,
      };

      const updatedPlans = get().plans.map((p) => (p.id === planId || p._id === planId ? updatedPlan : p));

      set({ plans: updatedPlans, activePlan: updatedPlan });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));

      // API sync
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          await API.patch(
            `/workout-plans/${planId}/log-day`,
            { dayIndex, isSkipped: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          console.log('API sync warning (skip-day):', e.message);
        }
      }

      return { success: true, skippedDayTitle: todaySession.dayTitle };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
}));

export default useWorkoutPlanStore;
