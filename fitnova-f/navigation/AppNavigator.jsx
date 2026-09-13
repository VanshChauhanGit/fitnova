import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BottomTabNavigator from './BottomTabNavigator';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ExerciseDetailScreen from '../screens/workout/ExerciseDetailScreen';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import WorkoutHistoryScreen from '../screens/workout/WorkoutHistoryScreen';

import WorkoutPlansScreen from '../screens/workout/WorkoutPlanScreen';
import CreateEditWorkoutPlanScreen from '../screens/workout/CreateEditWorkoutPlanScreen';
import WorkoutPlanDetailScreen from '../screens/workout/WorkoutPlanDetailScreen';
import WorkoutLoggingSessionScreen from '../screens/workout/WorkoutLoggingSessionScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />

      {/* WORKOUT PLAN SCREENS */}
      <Stack.Screen name="WorkoutPlans" component={WorkoutPlansScreen} />
      <Stack.Screen name="CreateEditWorkoutPlan" component={CreateEditWorkoutPlanScreen} />
      <Stack.Screen name="WorkoutPlanDetail" component={WorkoutPlanDetailScreen} />
      <Stack.Screen name="WorkoutLoggingSession" component={WorkoutLoggingSessionScreen} />
    </Stack.Navigator>
  );
}
