import { create } from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';

import API from '../api/axios';

const useWorkoutStore = create((set) => ({
  currentWorkout: [],

  workoutHistory: [],

  workoutName: '',

  workoutNotes: '',

  analytics: null,

  loading: false,

  setWorkoutName: (name) => {
    set({
      workoutName: name,
    });
  },

  setWorkoutNotes: (notes) => {
    set({
      workoutNotes: notes,
    });
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
  saveWorkout: async (duration) => {
    try {
      set({ loading: true });

      const token = await AsyncStorage.getItem('token');

      const state = useWorkoutStore.getState();

      const res = await API.post(
        '/workouts',
        {
          exercises: state.currentWorkout,

          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set((state) => ({
        workoutHistory: [res.data, ...state.workoutHistory],

        currentWorkout: [],

        loading: false,
      }));

      return {
        success: true,
      };
    } catch (error) {
      set({ loading: false });

      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },

  // FETCH HISTORY
  fetchWorkoutHistory: async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await API.get('/workouts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        workoutHistory: res.data,
      });
    } catch (error) {
      console.log(error);
    }
  },

  // FETCH ANALYTICS
  fetchAnalytics: async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const res = await API.get('/workouts/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        analytics: res.data,
      });
    } catch (error) {
      console.log(error);
    }
  },
}));

export default useWorkoutStore;
