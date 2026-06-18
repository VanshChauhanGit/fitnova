import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import useWorkoutStore from '../../store/workoutStore';

import { useEffect } from 'react';

import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  const analytics = useWorkoutStore((state) => state.analytics);

  const fetchAnalytics = useWorkoutStore((state) => state.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#071e00] px-5 pt-16">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base text-gray-400">Welcome Back 👋</Text>

          <Text className="mt-1 text-3xl font-bold text-white">{user.name}</Text>
        </View>

        <TouchableOpacity className="rounded-2xl bg-[#112b0a] p-3">
          <Ionicons name="notifications-outline" size={24} color="#3efe18" />
        </TouchableOpacity>
      </View>

      {/* WORKOUT CARD */}
      <View className="mt-8 rounded-3xl bg-[#112b0a] p-6">
        <Text className="text-gray-400">Today's Workout</Text>

        <Text className="mt-2 text-3xl font-bold text-white">Chest Day</Text>

        <Text className="mt-2 text-gray-400">6 Exercises • 90 Minutes</Text>

        <TouchableOpacity className="mt-6 rounded-2xl bg-[#3efe18] py-4">
          <Text className="text-center font-bold text-black">Start Workout</Text>
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View className="mt-8 flex-row justify-between">
        <View className="w-[48%] rounded-3xl bg-[#112b0a] p-5">
          <Text className="text-gray-400">Calories</Text>

          <Text className="mt-2 text-3xl font-bold text-white">
            {analytics?.totalCalories || 0}
          </Text>
        </View>

        <View className="w-[48%] rounded-3xl bg-[#112b0a] p-5">
          <Text className="text-gray-400">Streak</Text>

          <Text className="mt-2 text-3xl font-bold text-white">{analytics?.streak || 0} 🔥</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text className="mb-5 mt-10 text-2xl font-bold text-white">Quick Actions</Text>

      <View className="flex-row flex-wrap justify-between">
        {['Track Workout', 'Add Meal', 'Track Weight', 'Progress'].map((item, index) => (
          <TouchableOpacity key={index} className="mb-4 w-[48%] rounded-3xl bg-[#112b0a] p-6">
            <Text className="text-lg font-semibold text-white">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
