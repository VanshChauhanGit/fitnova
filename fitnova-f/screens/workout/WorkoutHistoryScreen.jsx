import { View, Text, ScrollView } from 'react-native';
import { useEffect } from 'react';

import useWorkoutStore from '../../store/workoutStore';

export default function WorkoutHistoryScreen() {
  const history = useWorkoutStore((state) => state.workoutHistory);

  console.log(history);

  const fetchWorkoutHistory = useWorkoutStore((state) => state.fetchWorkoutHistory);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#071e00] px-5 pt-16">
      <Text className="text-4xl font-bold text-white">Workout History</Text>

      {history.map((workout) => (
        <View key={workout._id} className="mt-5 rounded-3xl bg-[#112b0a] p-5">
          <Text className="text-xl font-bold text-white">
            {new Date(workout.date).toDateString()}
          </Text>

          <Text className="mt-2 text-gray-400">{workout.exercises.length} Exercises</Text>
        </View>
      ))}

      <View className="h-32" />
    </ScrollView>
  );
}
