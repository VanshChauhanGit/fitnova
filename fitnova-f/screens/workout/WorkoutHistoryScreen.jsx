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
    <ScrollView className="flex-1 bg-[#121417] px-5 pt-16">
      <Text className="text-3xl font-black text-[#E8EAED]">Workout History</Text>
      <Text className="text-xs text-[#9AA0A6] mt-1 mb-4">Past logged workout sessions</Text>

      {history.map((workout) => (
        <View key={workout._id || workout.id} className="mt-3.5 rounded-3xl bg-[#1F2328] border border-[#2D333B] p-5 shadow-sm">
          <Text className="text-lg font-black text-[#E8EAED]">
            {new Date(workout.date || workout.createdAt).toDateString()}
          </Text>

          <Text className="mt-1 text-xs font-semibold text-[#2D9CDB]">
            {workout.exercises?.length || 0} Exercises Logged
          </Text>
        </View>
      ))}

      <View className="h-32" />
    </ScrollView>
  );
}
