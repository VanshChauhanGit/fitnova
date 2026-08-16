import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import useWorkoutStore from '../../store/workoutStore';
import { useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';

export default function DashboardScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const analytics = useWorkoutStore((state) => state.analytics);
  const fetchAnalytics = useWorkoutStore((state) => state.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const quickActionIcons = [
    { label: 'Exercises', icon: <MaterialCommunityIcons name="dumbbell" size={24} color="#10B981" />, route: 'Exercises' },
    { label: 'Log Meal', icon: <Ionicons name="nutrition-outline" size={24} color="#F97316" />, route: null },
    { label: 'Track Weight', icon: <FontAwesome5 name="weight" size={20} color="#06B6D4" />, route: 'Profile' },
    { label: 'Analytics', icon: <Ionicons name="analytics" size={24} color="#A855F7" />, route: 'Progress' },
  ];

  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-5 pt-16">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <View className="relative mr-3">
            <Image
              source={{
                uri:
                  user?.profileImage ||
                  (user?.gender === 'male'
                    ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop'
                    : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop'),
              }}
              className="h-12 w-12 rounded-full border-2 border-[#10B981]"
            />
            <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0B0E14] bg-[#10B981]" />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Welcome back 👋
            </Text>
            <Text className="text-2xl font-black text-white">{user?.name || 'Athlete'}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="relative rounded-2xl border border-slate-800 bg-[#151B26] p-3">
          <Ionicons name="notifications-outline" size={22} color="#F8FAFC" />
          <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#10B981]" />
        </TouchableOpacity>
      </View>

      {/* TODAY'S WORKOUT HERO CARD */}
      <View className="mt-7 overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#151B26] p-6 shadow-xl shadow-black/40">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30">
            <Text className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
              Today{"'"}s Session
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text className="ml-1 text-xs font-semibold text-slate-400">60 mins</Text>
          </View>
        </View>

        <Text className="mt-3 text-3xl font-black text-white">Chest & Triceps Hypertrophy</Text>
        <Text className="mt-1 text-sm font-medium text-slate-400">6 exercises • 18 sets total</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('Exercises')}
          className="mt-6 flex-row items-center justify-center rounded-2xl bg-[#10B981] py-4 shadow-lg shadow-emerald-950/40">
          <Ionicons name="book-outline" size={20} color="#0B0E14" style={{ marginRight: 6 }} />
          <Text className="text-base font-bold text-[#0B0E14]">Explore Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* STATS GRID */}
      <View className="mt-6 flex-row justify-between">
        {/* Calories */}
        <View className="w-[48%] rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-slate-400">Calories Burned</Text>
            <View className="rounded-xl bg-orange-500/10 p-2">
              <MaterialCommunityIcons name="fire" size={20} color="#F97316" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-white">
            {analytics?.totalCalories || 480}
          </Text>
          <Text className="mt-1 text-xs font-medium text-emerald-400">kCal total</Text>
        </View>

        {/* Streak */}
        <View className="w-[48%] rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-slate-400">Current Streak</Text>
            <View className="rounded-xl bg-emerald-500/10 p-2">
              <Ionicons name="flash" size={20} color="#10B981" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-white">
            {analytics?.streak || 5} <Text className="text-lg">Days</Text>
          </Text>
          <Text className="mt-1 text-xs font-medium text-emerald-400">On fire! 🔥</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text className="mb-4 mt-8 text-xl font-black text-white">Quick Actions</Text>

      <View className="flex-row flex-wrap justify-between">
        {quickActionIcons.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => action.route && navigation?.navigate(action.route)}
            className="mb-4 w-[48%] flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] p-4">
            <View className="rounded-xl bg-slate-900 p-3.5 border border-slate-800">
              {action.icon}
            </View>
            <Text className="ml-3 text-sm font-bold text-white flex-1">{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
