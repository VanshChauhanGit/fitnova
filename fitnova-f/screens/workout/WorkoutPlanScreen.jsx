import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import useAuthStore from '../../store/authStore';
import { exportPlanToPDF } from '../../utils/pdfExporter';

export default function WorkoutPlansScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const { plans, activePlan, loading, loadPlans, deletePlan, getTodayMappedSession, markDayComplete } = useWorkoutPlanStore();

  const [activeTab, setActiveTab] = useState('my-plans'); // 'my-plans' | 'calendar'

  useEffect(() => {
    loadPlans();
  }, []);

  const todaySession = getTodayMappedSession();

  const handleExportPDF = (plan) => {
    exportPlanToPDF(plan, user?.name || 'Athlete');
  };

  const handleDelete = (plan) => {
    const planId = plan.id || plan._id;
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deletePlan(planId);
            if (res.success) {
              Alert.alert('Plan Deleted', `"${plan.name}" has been removed.`);
            } else {
              Alert.alert('Error', res.message || 'Failed to delete plan.');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#0B0E14] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-slate-800">
        <View>
          <Text className="text-2xl font-black text-white">Workout Plans</Text>
          <Text className="text-xs text-slate-400">Hypertrophy & Strength Splits</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
          className="flex-row items-center rounded-2xl bg-[#10B981] px-4 py-2.5 shadow-lg">
          <Ionicons name="add" size={18} color="#0B0E14" />
          <Text className="ml-1 text-xs font-extrabold text-[#0B0E14]">Create Plan</Text>
        </TouchableOpacity>
      </View>

      {/* TOP NAVIGATION TABS */}
      <View className="flex-row px-5 mt-4">
        {[
          { key: 'my-plans', label: 'My Plans', icon: 'list-outline' },
          { key: 'calendar', label: 'Calendar Schedule', icon: 'calendar-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 flex-row items-center justify-center py-2.5 mr-2 rounded-2xl border ${
              activeTab === tab.key
                ? 'border-[#10B981] bg-[#10B981]/15'
                : 'border-slate-800 bg-[#151B26]'
            }`}>
            <Ionicons
              name={tab.icon}
              size={15}
              color={activeTab === tab.key ? '#10B981' : '#94A3B8'}
            />
            <Text
              className={`ml-1.5 text-xs font-bold ${
                activeTab === tab.key ? 'text-[#10B981]' : 'text-slate-400'
              }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {/* TAB 1: MY PLANS */}
          {activeTab === 'my-plans' && (
            <View>
              {plans.length === 0 ? (
                <View className="rounded-3xl border border-dashed border-slate-800 p-8 items-center mt-6">
                  <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#64748B" />
                  <Text className="mt-3 text-base font-bold text-white">No Workout Plan Created Yet</Text>
                  <Text className="mt-1 text-xs text-slate-400 text-center px-4">
                    Create your custom split plan! Recommended preset templates (6-Day PPL, 4-Day Upper/Lower, 7-Day Split) are available inside the plan builder.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
                    className="mt-5 flex-row items-center rounded-2xl bg-[#10B981] px-5 py-3.5 shadow-lg">
                    <Ionicons name="add" size={18} color="#0B0E14" style={{ marginRight: 6 }} />
                    <Text className="font-extrabold text-[#0B0E14]">+ Create Workout Plan</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                plans.map((p) => {
                  const isPlanActive =
                    activePlan?.id === p.id ||
                    activePlan?._id === p._id ||
                    p.isActive;

                  return (
                    <TouchableOpacity
                      key={p.id || p._id}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: p })}
                      className={`mb-4 overflow-hidden rounded-3xl border p-5 ${
                        isPlanActive
                          ? 'border-emerald-500/50 bg-[#151B26] shadow-lg shadow-emerald-950/20'
                          : 'border-slate-800 bg-[#151B26]'
                      }`}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-2">
                          <View className="rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/30">
                            <Text className="text-xs font-bold text-[#10B981]">
                              {p.splitDays || p.days?.length || 6}-Day Split
                            </Text>
                          </View>
                          <View className="rounded-full bg-slate-800 px-3 py-1 border border-slate-700">
                            <Text className="text-xs font-medium text-cyan-400">
                              {p.goal || 'Build Muscle'}
                            </Text>
                          </View>
                        </View>

                        {isPlanActive ? (
                          <View className="flex-row items-center rounded-full bg-emerald-500/20 px-3 py-1 border border-emerald-500/40">
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text className="ml-1 text-xs font-extrabold text-emerald-400">ACTIVE</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center rounded-full bg-slate-800/80 px-3 py-1 border border-slate-700">
                            <Ionicons name="ellipse-outline" size={12} color="#94A3B8" />
                            <Text className="ml-1 text-xs font-bold text-slate-400">Inactive</Text>
                          </View>
                        )}
                      </View>

                      <Text className="mt-3 text-xl font-black text-white">{p.name}</Text>
                      <Text className="mt-1 text-xs text-slate-400" numberOfLines={2}>
                        {p.description || 'Custom hypertrophy & progressive overload split program.'}
                      </Text>

                      {/* QUICK ACTION BUTTONS */}
                      <View className="mt-4 flex-row items-center justify-between border-t border-slate-800/80 pt-3">
                        <Text className="text-xs font-semibold text-slate-400">
                          {p.days?.length || 0} Routine Days
                        </Text>

                        <View className="flex-row items-center space-x-2">
                          <TouchableOpacity
                            onPress={() => handleExportPDF(p)}
                            className="flex-row items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 mr-2">
                            <Ionicons name="document-text-outline" size={14} color="#10B981" />
                            <Text className="ml-1 text-xs font-bold text-emerald-400">PDF</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan: p })}
                            className="rounded-xl bg-slate-800 p-2 border border-slate-700 mr-2">
                            <Ionicons name="create-outline" size={14} color="#F8FAFC" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDelete(p)}
                            className="rounded-xl bg-red-500/10 p-2 border border-red-500/20">
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 2: CALENDAR SCHEDULE & SMART AUTO-MAPPING */}
          {activeTab === 'calendar' && (
            <View>
              {todaySession ? (
                <View className="rounded-3xl border border-emerald-500/30 bg-[#151B26] p-6 shadow-xl">
                  <View className="flex-row items-center justify-between">
                    <View className="rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30">
                      <Text className="text-xs font-extrabold uppercase tracking-wider text-[#10B981]">
                        Smart Calendar Auto-Mapping
                      </Text>
                    </View>
                    <Ionicons name="calendar" size={20} color="#10B981" />
                  </View>

                  <Text className="mt-4 text-2xl font-black text-white">{todaySession.dayTitle}</Text>
                  <Text className="mt-1 text-xs text-slate-400">
                    Plan: <Text className="font-bold text-white">{todaySession.planName}</Text> • Cycle Day {todaySession.dayNumber}/{todaySession.splitDays}
                  </Text>

                  {/* AUTO-ROLLOVER NOTICE PILL */}
                  <View
                    className={`mt-4 rounded-2xl p-3.5 border ${
                      todaySession.isRolledOver
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-emerald-500/30 bg-emerald-500/10'
                    }`}>
                    <View className="flex-row items-start">
                      <Text className="mr-2 text-base">
                        {todaySession.isRolledOver ? '⚡' : '✓'}
                      </Text>
                      <View className="flex-1">
                        <Text
                          className={`text-xs font-bold ${
                            todaySession.isRolledOver ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                          {todaySession.statusLabel}
                        </Text>
                        <Text className="mt-0.5 text-xs text-slate-400">
                          {todaySession.isRolledOver
                            ? 'Our engine automatically shifted your schedule to pending routine day so you never skip muscle groups.'
                            : 'You are on track with your routine cycle schedule.'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* TODAY'S EXERCISES PREVIEW */}
                  <View className="mt-4 border-t border-slate-800 pt-4">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Today{"'"}s Target Exercises ({todaySession.exercises?.length || 0})
                    </Text>
                    {todaySession.isRestDay ? (
                      <Text className="text-xs text-slate-400 italic">
                        Today is scheduled for active recovery and rest!
                      </Text>
                    ) : (
                      todaySession.exercises.map((ex, idx) => (
                        <View key={ex.exerciseId || idx} className="flex-row items-center justify-between py-1.5">
                          <Text className="text-xs font-bold text-slate-200">
                            {idx + 1}. {ex.name}
                          </Text>
                          <Text className="text-xs text-emerald-400">
                            {ex.sets} x {ex.reps} ({ex.bodyPart})
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View className="mt-5 flex-row flex-wrap justify-between">
                    <TouchableOpacity
                      onPress={async () => {
                        await markDayComplete(todaySession.dayIndex);
                        Alert.alert('Session Completed! 🔥', 'Great job! Schedule advanced to next routine day.');
                      }}
                      className="w-[48%] mb-2 rounded-2xl bg-[#10B981] py-3.5 items-center">
                      <Text className="text-xs font-extrabold text-[#0B0E14]">
                        ✓ Log Completed
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Skip Today\'s Session',
                          `Are you sure you want to skip "${todaySession.dayTitle}" for today? Your routine cycle will advance to the next day.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Skip Session',
                              style: 'destructive',
                              onPress: async () => {
                                const skipRes = await useWorkoutPlanStore.getState().skipTodaySession();
                                if (skipRes.success) {
                                  Alert.alert('Skipped Today ⏭️', `"${skipRes.skippedDayTitle}" was marked skipped. Schedule moved to next day.`);
                                }
                              },
                            },
                          ]
                        );
                      }}
                      className="w-[48%] mb-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 py-3.5 items-center">
                      <Text className="text-xs font-extrabold text-amber-400">
                        ⏭️ Skip Today
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('Exercises')}
                      className="w-full rounded-2xl bg-slate-800 border border-slate-700 py-3.5 items-center">
                      <Text className="text-xs font-bold text-white">Start Workout Session</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="rounded-3xl border border-slate-800 bg-[#151B26] p-6 items-center">
                  <Text className="text-slate-400 text-xs">No active plan set for calendar mapping.</Text>
                </View>
              )}
            </View>
          )}

          <View className="h-32" />
        </ScrollView>
      )}
    </View>
  );
}
