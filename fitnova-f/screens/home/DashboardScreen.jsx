import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import useWorkoutStore from '../../store/workoutStore';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import useAuthStore from '../../store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { exportPlanToPDF } from '../../utils/pdfExporter';

export default function DashboardScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const analytics = useWorkoutStore((state) => state.analytics);
  const fetchAnalytics = useWorkoutStore((state) => state.fetchAnalytics);

  const { activePlan, loadPlans, getTodayMappedSession } = useWorkoutPlanStore();

  useEffect(() => {
    fetchAnalytics();
    loadPlans();
  }, []);

  const todaySession = getTodayMappedSession();

  const handleExportPDF = () => {
    if (!activePlan) {
      Alert.alert('No Active Plan', 'Please create or select an active workout plan first.');
      return;
    }
    exportPlanToPDF(activePlan, user?.name || 'Athlete');
  };

  const quickActionIcons = [
    { label: 'Workout Plans', icon: <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#10B981" />, route: 'WorkoutPlans' },
    { label: 'Exercises', icon: <MaterialCommunityIcons name="dumbbell" size={24} color="#06B6D4" />, route: 'Exercises' },
    { label: 'Export PDF', icon: <Ionicons name="document-text-outline" size={24} color="#F59E0B" />, action: handleExportPDF },
    { label: 'Analytics', icon: <Ionicons name="analytics" size={24} color="#A855F7" />, route: 'Progress' },
  ];

  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-5 pt-16" showsVerticalScrollIndicator={false}>
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

      {/* TODAY'S DYNAMIC WORKOUT HERO CARD */}
      <View className="mt-7 overflow-hidden rounded-3xl border border-emerald-500/25 bg-[#151B26] p-6 shadow-xl shadow-black/40">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30">
            <Text className="text-xs font-extrabold uppercase tracking-wider text-[#10B981]">
              Today{"'"}s Session
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={15} color="#94A3B8" />
            <Text className="ml-1 text-xs font-semibold text-slate-400">
              {todaySession ? `Day ${todaySession.dayNumber}/${todaySession.splitDays}` : 'Custom Routine'}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-2xl font-black text-white">
          {todaySession ? todaySession.dayTitle : 'No Active Workout Plan'}
        </Text>
        <Text className="mt-1 text-xs font-medium text-slate-400">
          {todaySession && todaySession.exercises
            ? `${todaySession.exercises.length} exercises • ${todaySession.planName}`
            : 'Create your workout split to track daily routines & progressive overload.'}
        </Text>

        {/* SMART ROLLOVER / CATCH-UP NOTICE PILL */}
        {todaySession?.isRolledOver && (
          <View className="mt-3.5 flex-row items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
            <Text className="mr-2 text-sm">⚡</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold text-amber-400">
                {todaySession.statusLabel}
              </Text>
              <Text className="text-[10px] text-slate-400">
                Auto-mapped pending workout routine day so muscle groups are preserved.
              </Text>
            </View>
          </View>
        )}

        <View className="mt-5 flex-row flex-wrap justify-between">
          {todaySession ? (
            <>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation?.navigate('Exercises')}
                className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl bg-[#10B981] py-3.5 shadow-lg shadow-emerald-950/40">
                <Ionicons name="play" size={18} color="#0B0E14" style={{ marginRight: 6 }} />
                <Text className="text-xs font-extrabold text-[#0B0E14]">Start Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Alert.alert(
                    'Skip Today\'s Session',
                    `Skip "${todaySession.dayTitle}" for today? The schedule will advance to the next day in your cycle.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Skip Session',
                        style: 'destructive',
                        onPress: async () => {
                          const res = await useWorkoutPlanStore.getState().skipTodaySession();
                          if (res.success) {
                            Alert.alert('Session Skipped ⏭️', `"${res.skippedDayTitle}" was marked skipped.`);
                          }
                        },
                      },
                    ]
                  );
                }}
                className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3.5">
                <Ionicons name="play-skip-forward" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text className="text-xs font-bold text-amber-400">Skip Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation?.navigate('WorkoutPlans')}
                className="w-full flex-row items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 py-3">
                <Ionicons name="list-outline" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />
                <Text className="text-xs font-bold text-white">Manage Plan & Calendar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation?.navigate('Exercises')}
                className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl bg-[#10B981] py-3.5 shadow-lg shadow-emerald-950/40">
                <Ionicons name="play" size={18} color="#0B0E14" style={{ marginRight: 6 }} />
                <Text className="text-xs font-extrabold text-[#0B0E14]">Start Session</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation?.navigate('CreateEditWorkoutPlan')}
                className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5">
                <Ionicons name="add" size={18} color="#10B981" style={{ marginRight: 6 }} />
                <Text className="text-xs font-bold text-emerald-400">Create Plan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* WORKOUT PLAN SECTION */}
      <View className="mt-7 flex-row items-center justify-between">
        <Text className="text-xl font-black text-white">Active Workout Routine</Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate('WorkoutPlans')}
          className="flex-row items-center">
          <Text className="text-xs font-bold text-[#10B981] mr-1">View All Plans</Text>
          <Ionicons name="chevron-forward" size={14} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* WORKOUT PLAN SUMMARY CARD */}
      <View className="mt-3 rounded-3xl border border-slate-800 bg-[#151B26] p-5 shadow-lg">
        {activePlan ? (
          <>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <View className="rounded-xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 mr-3">
                  <MaterialCommunityIcons name="arm-flex" size={24} color="#10B981" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-white">
                    {activePlan.name}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {activePlan.splitDays || 6}-Day Split • {activePlan.goal || 'Build Muscle'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleExportPDF}
                className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-3">
                <Ionicons name="share-outline" size={18} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* DAY PREVIEW STRIP */}
            <View className="mt-4 border-t border-slate-800/80 pt-3">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Split Days Overview
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {(activePlan.days || []).map((d) => {
                  const isToday = todaySession && todaySession.dayNumber === d.dayNumber;
                  return (
                    <TouchableOpacity
                      key={d.dayNumber}
                      onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activePlan })}
                      className={`mr-2 rounded-xl border px-3 py-2 ${
                        isToday
                          ? 'border-[#10B981] bg-[#10B981]/20'
                          : 'border-slate-800 bg-[#0B0E14]'
                      }`}>
                      <Text
                        className={`text-[10px] font-extrabold ${
                          isToday ? 'text-[#10B981]' : 'text-slate-400'
                        }`}>
                        D{d.dayNumber}: {d.isRestDay ? 'Rest 😴' : d.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View className="mt-4 flex-row space-x-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
                className="flex-1 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 py-3 items-center mr-2">
                <Text className="text-xs font-bold text-emerald-400">+ Create New Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activePlan })}
                className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 py-3 items-center">
                <Text className="text-xs font-bold text-slate-200">Plan Details</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="py-4 items-center">
            <MaterialCommunityIcons name="clipboard-plus-outline" size={40} color="#64748B" />
            <Text className="mt-2 text-base font-extrabold text-white">No Active Workout Routine</Text>
            <Text className="mt-1 text-xs text-slate-400 text-center px-4">
              Build your custom split plan. Recommended presets (6-Day PPL, 4-Day Upper/Lower) can be loaded in 1-click when creating a plan!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
              className="mt-4 flex-row items-center rounded-2xl bg-[#10B981] px-5 py-3 shadow-lg">
              <Ionicons name="add" size={18} color="#0B0E14" style={{ marginRight: 6 }} />
              <Text className="text-xs font-extrabold text-[#0B0E14]">+ Create Workout Plan</Text>
            </TouchableOpacity>
          </View>
        )}
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
            onPress={() => {
              if (action.action) action.action();
              else if (action.route) navigation?.navigate(action.route);
            }}
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
