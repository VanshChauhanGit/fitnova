import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';

import EditProfileScreen from '../screens/profile/EditProfileScreen';

import ExerciseDetailScreen from '../screens/workout/ExerciseDetailScreen';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import WorkoutHistoryScreen from '../screens/workout/WorkoutHistoryScreen';

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
    </Stack.Navigator>
  );
}
