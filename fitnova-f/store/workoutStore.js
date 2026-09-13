import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';
import { startAlarm, stopAlarm, unlockAudio } from '../utils/alarm';

let globalTimerInterval = null;

const useWorkoutStore = create((set, get) => ({
  currentWorkout: [],
  workoutHistory: [],
  workoutName: '',
  workoutNotes: '',
  analytics: null,
  loading: false,

  // GLOBAL ACTIVE SESSION PERSISTENT STATE
  activeSession: null, // { sessionInfo, elapsedSeconds, exerciseLogs, restSeconds, restActive, defaultRestTarget, restAlarmActive }
  isSessionActive: false,

  // START OR RESUME GLOBAL SESSION
  startSession: (sessionData) => {
    const existing = get().activeSession;

    // If session is already running, return existing running session
    if (existing && existing.sessionInfo) {
      return existing;
    }

    const initialLogs = sessionData && sessionData.exercises ? sessionData.exercises.map((ex, exIdx) => {
      const defaultSetsCount = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets, 10) || 3;
      const defaultReps = typeof ex.reps === 'string' ? parseInt(ex.reps.split('-')[0], 10) || 10 : ex.reps || 10;
      const sets = Array.from({ length: defaultSetsCount }).map((_, sIdx) => ({
        id: `set-${exIdx}-${sIdx}-${Date.now()}-${sIdx}`,
        setNum: sIdx + 1,
        weight: '0',
        reps: String(defaultReps),
        completed: false,
      }));

      return {
        exerciseId: ex.exerciseId || ex.id || `ex-${exIdx}`,
        name: ex.name || ex.title || 'Exercise',
        bodyPart: ex.bodyPart || ex.target || 'General',
        notes: ex.notes || '',
        targetReps: ex.reps || '10',
        sets,
      };
    }) : [];

    const newSession = {
      sessionInfo: sessionData || { dayTitle: 'Custom Workout Session', dayIndex: 0 },
      startTime: Date.now(),
      elapsedSeconds: 0,
      exerciseLogs: initialLogs,
      restSeconds: 0,
      restActive: false,
      restAlarmActive: false,
      defaultRestTarget: 60,
    };

    set({ activeSession: newSession, isSessionActive: true });

    // Start global background interval timer if not running
    if (!globalTimerInterval) {
      globalTimerInterval = setInterval(() => {
        const cur = get().activeSession;
        if (!cur) return;

        const nextElapsed = cur.elapsedSeconds + 1;
        let nextRestSec = cur.restSeconds;
        let nextRestActive = cur.restActive;
        let nextRestAlarmActive = cur.restAlarmActive || false;

        if (cur.restActive && cur.restSeconds > 0) {
          nextRestSec = cur.restSeconds - 1;
          if (nextRestSec <= 0) {
            nextRestSec = 0;
            nextRestActive = false;
            nextRestAlarmActive = true;
            // TRIGGER ALARM AUDIO + VIBRATION
            startAlarm();
          }
        }

        set({
          activeSession: {
            ...cur,
            elapsedSeconds: nextElapsed,
            restSeconds: nextRestSec,
            restActive: nextRestActive,
            restAlarmActive: nextRestAlarmActive,
          },
        });
      }, 1000);
    }

    return newSession;
  },

  // UPDATE ACTIVE SESSION IN-FLIGHT
  updateActiveSession: (updates) => {
    const cur = get().activeSession;
    if (cur) {
      set({ activeSession: { ...cur, ...updates } });
    }
  },

  // REST TIMER HELPERS & ALARM CONTROLS
  startRestTimer: (seconds) => {
    unlockAudio();
    stopAlarm();
    const cur = get().activeSession;
    if (cur) {
      const targetSec = seconds !== undefined ? seconds : cur.defaultRestTarget || 60;
      set({
        activeSession: {
          ...cur,
          restSeconds: targetSec,
          restActive: true,
          restAlarmActive: false,
          defaultRestTarget: targetSec,
        },
      });
    }
  },

  stopRestTimer: () => {
    stopAlarm();
    const cur = get().activeSession;
    if (cur) {
      set({
        activeSession: {
          ...cur,
          restSeconds: 0,
          restActive: false,
          restAlarmActive: false,
        },
      });
    }
  },

  dismissRestAlarm: () => {
    stopAlarm();
    const cur = get().activeSession;
    if (cur) {
      set({
        activeSession: {
          ...cur,
          restAlarmActive: false,
        },
      });
    }
  },

  extendRestTimer: (extraSeconds = 30) => {
    unlockAudio();
    stopAlarm();
    const cur = get().activeSession;
    if (cur) {
      const newSec = (cur.restSeconds || 0) + extraSeconds;
      set({
        activeSession: {
          ...cur,
          restSeconds: newSec,
          restActive: true,
          restAlarmActive: false,
        },
      });
    }
  },

  // EXIT / CLEAR ACTIVE SESSION
  clearActiveSession: () => {
    stopAlarm();
    if (globalTimerInterval) {
      clearInterval(globalTimerInterval);
      globalTimerInterval = null;
    }
    set({ activeSession: null, isSessionActive: false });
  },

  setWorkoutName: (name) => {
    set({ workoutName: name });
  },

  setWorkoutNotes: (notes) => {
    set({ workoutNotes: notes });
  },

  removeExercise: (exerciseId) => {
    set((state) => ({
      currentWorkout: state.currentWorkout.filter((exercise) => exercise.exerciseId !== exerciseId),
    }));
  },

  // ADD SET
  addSet: (exercise, setData, supersetGroup = null) => {
    set((state) => {
      const existingExercise = state.currentWorkout.find((item) => item.exerciseId === exercise.id);

      if (existingExercise) {
        return {
          currentWorkout: state.currentWorkout.map((item) =>
            item.exerciseId === exercise.id
              ? {
                  ...item,
                  sets: [...item.sets, setData],
                }
              : item
          ),
        };
      }

      return {
        currentWorkout: [
          ...state.currentWorkout,
          {
            exerciseId: exercise.id,
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            gifUrl: exercise.gifUrl,
            supersetGroup,
            sets: [setData],
          },
        ],
      };
    });
  },

  // SAVE WORKOUT
  saveWorkout: async (duration, formattedExercises, workoutTitle = 'Workout Session') => {
    try {
      set({ loading: true });
      const token = await AsyncStorage.getItem('token');
      const state = useWorkoutStore.getState();

      const exercisesToSave = formattedExercises || state.currentWorkout;

      let savedWorkout = null;

      if (token) {
        try {
          const res = await API.post(
            '/workouts',
            {
              title: workoutTitle,
              workoutName: workoutTitle,
              exercises: exercisesToSave,
              duration,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data) {
            savedWorkout = {
              ...res.data,
              id: res.data._id || res.data.id,
              title: res.data.workoutName || res.data.title || workoutTitle,
            };
          }
        } catch (_apiErr) {
          console.log('Error saving workout to API:', _apiErr.message);
        }
      }

      if (!savedWorkout) {
        savedWorkout = {
          id: `workout-${Date.now()}`,
          title: workoutTitle || 'Workout Session',
          workoutName: workoutTitle || 'Workout Session',
          duration,
          exercises: exercisesToSave,
          createdAt: new Date().toISOString(),
        };
      }

      const updatedHistory = [savedWorkout, ...(state.workoutHistory || [])];
      set({
        workoutHistory: updatedHistory,
        currentWorkout: [],
        loading: false,
      });

      // Clear active global session
      get().clearActiveSession();

      return { success: true, workout: savedWorkout };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // FETCH HISTORY
  fetchWorkoutHistory: async () => {
    try {
      set({ loading: true });
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await API.get('/workouts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && Array.isArray(res.data)) {
          const formattedHistory = res.data.map((w) => ({
            ...w,
            id: w._id || w.id,
            title: w.workoutName || w.title || 'Workout Session',
          }));
          set({ workoutHistory: formattedHistory, loading: false });
          return;
        }
      }
      set({ workoutHistory: [], loading: false });
    } catch (error) {
      console.log('Error fetching history from backend:', error.message);
      set({ loading: false });
    }
  },

  // DELETE WORKOUT FROM HISTORY
  deleteWorkoutFromHistory: async (workoutId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && typeof workoutId === 'string' && /^[0-9a-fA-F]{24}$/.test(workoutId)) {
        await API.delete(`/workouts/${workoutId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const current = get().workoutHistory || [];
      const updated = current.filter((w) => w.id !== workoutId && w._id !== workoutId);
      set({ workoutHistory: updated });

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // FETCH ANALYTICS
  fetchAnalytics: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const res = await API.get('/workouts/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ analytics: res.data });
      }
    } catch (error) {
      console.log('Error fetching analytics:', error.message);
    }
  },
}));

export default useWorkoutStore;
