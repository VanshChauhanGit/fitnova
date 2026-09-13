import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import useWorkoutStore from '../../store/workoutStore';
import useAuthStore from '../../store/authStore';
import { exportPlanToPDF } from '../../utils/pdfExporter';

export default function WorkoutPlansScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const {
    plans,
    activePlan,
    loading,
    loadPlans,
    deletePlan,
    getTodayMappedSession,
    getTomorrowSession,
    markDayComplete,
  } = useWorkoutPlanStore();

  const [activeTab, setActiveTab] = useState('my-plans'); // 'my-plans' | 'calendar'

  useEffect(() => {
    loadPlans();
  }, []);

  const todaySession = getTodayMappedSession();
  const tomorrowSession = getTomorrowSession();

  const handleStartWorkoutSession = (sessionData) => {
    const { isSessionActive, activeSession, clearActiveSession, startSession } = useWorkoutStore.getState();

    if (isSessionActive && activeSession) {
      const currentTitle = activeSession.sessionInfo?.dayTitle || 'Active Workout';

      if (
        sessionData &&
        activeSession.sessionInfo?.dayNumber === sessionData.dayNumber &&
        activeSession.sessionInfo?.planId === sessionData.planId
      ) {
        navigation.navigate('WorkoutLoggingSession');
        return;
      }

      Alert.alert(
        'Workout Session In Progress 🏋️',
        `You already have an active workout session running ("${currentTitle}").\n\nWould you like to resume your active session or discard it to start a new workout?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Resume Active Session',
            onPress: () => navigation.navigate('WorkoutLoggingSession'),
          },
          {
            text: 'Discard & Start New',
            style: 'destructive',
            onPress: () => {
              clearActiveSession();
              if (sessionData) startSession(sessionData);
              navigation.navigate('WorkoutLoggingSession', { session: sessionData });
            },
          },
        ]
      );
    } else {
      if (sessionData) startSession(sessionData);
      navigation.navigate('WorkoutLoggingSession', { session: sessionData });
    }
  };

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
    <View className="flex-1 bg-[#EBF7F4] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-[#017374]/15">
        <View>
          <Text className="text-2xl font-black text-[#014041]">Workout Plans</Text>
          <Text className="text-xs text-[#3A7574]">Hypertrophy & Strength Splits</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
          className="flex-row items-center rounded-2xl bg-[#017374] px-4 py-2.5 shadow-md border border-[#017374]/20">
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="ml-1 text-xs font-extrabold text-white">Create Plan</Text>
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
                ? 'border-[#017374] bg-[#017374]'
                : 'border-[#017374]/20 bg-white shadow-sm'
            }`}>
            <Ionicons
              name={tab.icon}
              size={15}
              color={activeTab === tab.key ? '#FFFFFF' : '#3A7574'}
            />
            <Text
              className={`ml-1.5 text-xs font-bold ${
                activeTab === tab.key ? 'text-white' : 'text-[#3A7574]'
              }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#017374" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {/* TAB 1: MY PLANS */}
          {activeTab === 'my-plans' && (
            <View>
              {plans.length === 0 ? (
                <View className="rounded-3xl border border-dashed border-[#017374]/20 p-8 items-center mt-6 bg-white">
                  <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#3A7574" />
                  <Text className="mt-3 text-base font-bold text-[#014041]">No Workout Plan Created Yet</Text>
                  <Text className="mt-1 text-xs text-[#025C5D] text-center px-4">
                    Create your custom split plan! Recommended preset templates (6-Day PPL, 4-Day Upper/Lower, 7-Day Split) are available inside the plan builder.
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
                    className="mt-5 flex-row items-center rounded-2xl bg-[#017374] px-5 py-3.5 shadow-md border border-[#017374]/20">
                    <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text className="font-extrabold text-white">+ Create Workout Plan</Text>
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
                          ? 'border-[#017374] bg-white shadow-md'
                          : 'border-[#017374]/15 bg-white shadow-sm'
                      }`}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-2">
                          <View className="rounded-full bg-[#017374]/15 px-3 py-1 border border-[#017374]/25">
                            <Text className="text-xs font-bold text-[#017374]">
                              {p.splitDays || p.days?.length || 6}-Day Split
                            </Text>
                          </View>
                          <View className="rounded-full bg-[#EBF7F4] px-3 py-1 border border-[#017374]/15">
                            <Text className="text-xs font-medium text-[#017374]">
                              {p.goal || 'Build Muscle'}
                            </Text>
                          </View>
                        </View>

                        {isPlanActive ? (
                          <View className="flex-row items-center rounded-full bg-[#017374] px-3 py-1 border border-[#017374]">
                            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                            <Text className="ml-1 text-xs font-extrabold text-white">ACTIVE</Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center rounded-full bg-[#EBF7F4] px-3 py-1 border border-[#017374]/15">
                            <Ionicons name="ellipse-outline" size={12} color="#3A7574" />
                            <Text className="ml-1 text-xs font-bold text-[#3A7574]">Inactive</Text>
                          </View>
                        )}
                      </View>

                      <Text className="mt-3 text-xl font-black text-[#014041]">{p.name}</Text>
                      <Text className="mt-1 text-xs text-[#025C5D]" numberOfLines={2}>
                        {p.description || 'Custom hypertrophy & progressive overload split program.'}
                      </Text>

                      {/* QUICK ACTION BUTTONS */}
                      <View className="mt-4 flex-row items-center justify-between border-t border-[#017374]/10 pt-3">
                        <Text className="text-xs font-semibold text-[#3A7574]">
                          {p.days?.length || 0} Routine Days
                        </Text>

                        <View className="flex-row items-center space-x-2">
                          <TouchableOpacity
                            onPress={() => handleExportPDF(p)}
                            className="flex-row items-center rounded-xl bg-[#017374]/15 border border-[#017374]/30 px-3 py-1.5 mr-2">
                            <Ionicons name="document-text-outline" size={14} color="#017374" />
                            <Text className="ml-1 text-xs font-bold text-[#017374]">PDF</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan: p })}
                            className="rounded-xl bg-[#EBF7F4] p-2 border border-[#017374]/15 mr-2">
                            <Ionicons name="create-outline" size={14} color="#014041" />
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
                <>
                  <View className="rounded-3xl border border-[#017374]/25 bg-white p-6 shadow-md">
                    <View className="flex-row items-center justify-between">
                      <View className="rounded-full bg-[#017374]/15 px-3.5 py-1 border border-[#017374]/30">
                        <Text className="text-xs font-extrabold uppercase tracking-wider text-[#017374]">
                          Smart Calendar Auto-Mapping
                        </Text>
                      </View>
                      <Ionicons name="calendar" size={20} color="#017374" />
                    </View>

                    <Text className="mt-4 text-2xl font-black text-[#014041]">{todaySession.dayTitle}</Text>
                    <Text className="mt-1 text-xs text-[#025C5D]">
                      Plan: <Text className="font-bold text-[#014041]">{todaySession.planName}</Text> • Cycle Day {todaySession.dayNumber}/{todaySession.splitDays}
                    </Text>

                    {/* STATUS OR ROLLOVER NOTICE */}
                    <View
                      className={`mt-4 rounded-2xl p-3.5 border ${
                        todaySession.isTodaySkipped
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : todaySession.isTodayCompleted
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : todaySession.isRolledOver
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-[#017374]/30 bg-[#017374]/15'
                      }`}>
                      <View className="flex-row items-start">
                        <Text className="mr-2 text-base">
                          {todaySession.isTodaySkipped ? '⏭️' : todaySession.isTodayCompleted ? '🎉' : todaySession.isRolledOver ? '⚡' : '✓'}
                        </Text>
                        <View className="flex-1">
                          <Text
                            className={`text-xs font-bold ${
                              todaySession.isTodaySkipped
                                ? 'text-amber-700'
                                : todaySession.isTodayCompleted
                                ? 'text-emerald-800'
                                : todaySession.isRolledOver
                                ? 'text-amber-700'
                                : 'text-[#017374]'
                            }`}>
                            {todaySession.statusLabel}
                          </Text>
                          <Text className="mt-0.5 text-xs text-[#025C5D]">
                            {todaySession.isTodaySkipped
                              ? 'This workout has been rescheduled for tomorrow so you will keep your full routine split.'
                              : todaySession.isTodayCompleted
                              ? 'You have logged your workout for today! Rest up for tomorrow.'
                              : todaySession.isRolledOver
                              ? 'Our engine automatically shifted your schedule to pending routine day so you never skip muscle groups.'
                              : 'You are on track with your routine cycle schedule.'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* TODAY'S EXERCISES PREVIEW */}
                    <View className="mt-4 border-t border-[#017374]/10 pt-4">
                      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-[#3A7574]">
                        Today{"'"}s Target Exercises ({Array.isArray(todaySession?.exercises) ? todaySession.exercises.length : 0})
                      </Text>
                      {todaySession.isRestDay ? (
                        <Text className="text-xs text-[#025C5D] italic">
                          Today is scheduled for active recovery and rest!
                        </Text>
                      ) : Array.isArray(todaySession?.exercises) && todaySession.exercises.length > 0 ? (
                        todaySession.exercises.map((ex, idx) => (
                          <View key={ex?.exerciseId || ex?.id || idx} className="flex-row items-center justify-between py-1.5">
                            <Text className="text-xs font-bold text-[#014041]">
                              {idx + 1}. {ex?.name || 'Exercise'}
                            </Text>
                            <Text className="text-xs text-[#017374]">
                              {ex?.sets || 0} x {ex?.reps || 0} ({ex?.bodyPart || 'General'})
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text className="text-xs text-[#025C5D] italic">No exercises added for today.</Text>
                      )}
                    </View>

                    <View className="mt-5 flex-row flex-wrap justify-between">
                      <TouchableOpacity
                        onPress={() => handleStartWorkoutSession(todaySession)}
                        className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl bg-[#017374] py-3.5 shadow-md border border-[#017374]/20">
                        <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text className="text-xs font-extrabold text-white">Start Workout</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            'Skip Today\'s Session',
                            `Are you sure you want to skip "${todaySession.dayTitle}" for today? This workout will be rescheduled for tomorrow.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Skip Session',
                                style: 'destructive',
                                onPress: async () => {
                                  const skipRes = await useWorkoutPlanStore.getState().skipTodaySession();
                                  if (skipRes.success) {
                                    Alert.alert('Skipped Today ⏭️', `"${skipRes.skippedDayTitle}" was rescheduled for tomorrow.`);
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        className="w-[48%] mb-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 py-3.5 items-center justify-center">
                        <Text className="text-xs font-extrabold text-amber-700">⏭️ Skip Today</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* TOMORROW PREVIEW CARD */}
                  {tomorrowSession && (
                    <View className="mt-5 rounded-3xl border border-[#017374]/20 bg-white p-5 shadow-sm">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-2">
                          <Ionicons name="calendar-outline" size={20} color="#017374" />
                          <View className="ml-2">
                            <Text className="text-[10px] font-extrabold text-[#3A7574] uppercase tracking-wider">UPCOMING TOMORROW</Text>
                            <Text className="text-base font-black text-[#014041]">{tomorrowSession.dayTitle}</Text>
                          </View>
                        </View>
                        <View className="rounded-full bg-[#EBF7F4] px-3 py-1 border border-[#017374]/15">
                          <Text className="text-[10px] font-extrabold text-[#017374]">Day {tomorrowSession.dayNumber}</Text>
                        </View>
                      </View>

                      {tomorrowSession.isSkippedRollover && (
                        <View className="mt-2.5 flex-row items-center rounded-xl bg-amber-500/10 px-3 py-1.5 border border-amber-500/20">
                          <Text className="text-xs mr-1.5">⏭️</Text>
                          <Text className="text-[11px] font-bold text-amber-700">
                            Rescheduled from today's skipped session
                          </Text>
                        </View>
                      )}

                      <View className="mt-3 pt-3 border-t border-[#017374]/10">
                        <Text className="text-xs font-semibold text-[#025C5D]">
                          {tomorrowSession.isRestDay
                            ? '😴 Active Recovery & Rest Day'
                            : `Target: ${Array.isArray(tomorrowSession.targetMuscles) && tomorrowSession.targetMuscles.length > 0 ? tomorrowSession.targetMuscles.join(', ') : 'Muscle Group'} • ${Array.isArray(tomorrowSession.exercises) ? tomorrowSession.exercises.length : 0} exercises`}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View className="rounded-3xl border border-[#017374]/15 bg-white p-6 items-center shadow-sm">
                  <Text className="text-[#3A7574] text-xs">No active plan set for calendar mapping.</Text>
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
