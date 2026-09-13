import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import useWorkoutStore from '../../store/workoutStore';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import useAuthStore from '../../store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { exportPlanToPDF } from '../../utils/pdfExporter';
import { sendInstantTestNotification } from '../../utils/notificationService';

export default function DashboardScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const analytics = useWorkoutStore((state) => state.analytics);
  const fetchAnalytics = useWorkoutStore((state) => state.fetchAnalytics);

  const {
    activePlan,
    loadPlans,
    getTodayMappedSession,
    getTomorrowSession,
    reminderTime,
    reminderEnabled,
    setReminderTime,
    toggleReminder,
  } = useWorkoutPlanStore();

  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    loadPlans();
  }, []);

  const todaySession = getTodayMappedSession();
  const tomorrowSession = getTomorrowSession();

  const handleExportPDF = () => {
    if (!activePlan) {
      Alert.alert('No Active Plan', 'Please create or select an active workout plan first.');
      return;
    }
    exportPlanToPDF(activePlan, user?.name || 'Athlete');
  };

  const handleTestNotification = async () => {
    const title = todaySession ? todaySession.dayTitle : "Today's Workout";
    const res = await sendInstantTestNotification(title);
    if (res.success) {
      Alert.alert('Notification Sent! 🔔', `Test notification delivered for "${title}".`);
    } else {
      Alert.alert('Notification Warning', res.message || 'Permission requested.');
    }
  };

  const reminderOptions = [
    { label: '7:00 AM', value: '07:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '8:00 PM', value: '20:00' },
    { label: '9:00 PM', value: '21:00' },
  ];

  const quickActionIcons = [
    { label: 'Workout Plans', icon: <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#017374" />, route: 'WorkoutPlans' },
    { label: 'Exercises', icon: <MaterialCommunityIcons name="dumbbell" size={24} color="#017374" />, route: 'Exercises' },
    { label: 'Export PDF', icon: <Ionicons name="document-text-outline" size={24} color="#D97706" />, action: handleExportPDF },
    { label: 'Analytics', icon: <Ionicons name="analytics" size={24} color="#017374" />, route: 'Progress' },
  ];

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

  return (
    <ScrollView className="flex-1 bg-[#EBF7F4] px-5 pt-16" showsVerticalScrollIndicator={false}>
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
              className="h-12 w-12 rounded-full border-2 border-[#017374]"
            />
            <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#EBF7F4] bg-[#017374]" />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-[#3A7574]">
              Welcome back 👋
            </Text>
            <Text className="text-2xl font-black text-[#014041]">{user?.name || 'Athlete'}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowTimeModal(true)}
          className="relative rounded-2xl border border-[#017374]/20 bg-white p-3 shadow-sm flex-row items-center">
          <Ionicons name="notifications-outline" size={22} color="#014041" />
          <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#017374]" />
        </TouchableOpacity>
      </View>

      {/* TODAY'S DYNAMIC WORKOUT HERO CARD */}
      <View className="mt-7 overflow-hidden rounded-3xl border border-[#017374]/25 bg-white p-6 shadow-md">
        {/* CARD TOP BADGE & DAY INFO */}
        <View className="flex-row items-center justify-between">
          <View
            className={`rounded-full px-3.5 py-1 border ${
              todaySession?.isTodaySkipped
                ? 'bg-amber-500/15 border-amber-500/30'
                : todaySession?.isTodayCompleted
                ? 'bg-emerald-500/15 border-emerald-500/30'
                : 'bg-[#017374]/15 border-[#017374]/30'
            }`}>
            <Text
              className={`text-xs font-extrabold uppercase tracking-wider ${
                todaySession?.isTodaySkipped
                  ? 'text-amber-700'
                  : todaySession?.isTodayCompleted
                  ? 'text-emerald-700'
                  : 'text-[#017374]'
              }`}>
              {todaySession?.isTodaySkipped
                ? "Today's Status: SKIPPED ⏭️"
                : todaySession?.isTodayCompleted
                ? "Today's Status: DONE ✓"
                : todaySession
                ? "Today's Session"
                : "Freestyle Workout"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name={todaySession ? "calendar-outline" : "flash-outline"} size={15} color="#3A7574" />
            <Text className="ml-1 text-xs font-semibold text-[#025C5D]">
              {todaySession ? `Day ${todaySession.dayNumber}/${todaySession.splitDays}` : 'Quick Session'}
            </Text>
          </View>
        </View>

        {/* WORKOUT TITLE & SUBTITLE */}
        <Text className="mt-3 text-2xl font-black text-[#014041]">
          {todaySession ? todaySession.dayTitle : 'Quick Workout Session'}
        </Text>

        <Text className="mt-1 text-xs font-medium text-[#025C5D]">
          {todaySession && todaySession.exercises
            ? `${todaySession.exercises.length} exercises • ${todaySession.targetMuscles?.join(', ') || todaySession.planName}`
            : 'Start a quick workout session, add exercises on the fly, and save it to your workout history!'}
        </Text>

        {/* ROLLOVER NOTICE IF ANY */}
        {todaySession?.isRolledOver && (
          <View className="mt-3.5 flex-row items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
            <Text className="mr-2 text-sm">⚡</Text>
            <View className="flex-1">
              <Text className="text-xs font-bold text-amber-700">{todaySession.statusLabel}</Text>
              <Text className="text-[10px] text-[#025C5D]">
                Auto-mapped pending workout routine day so muscle groups are preserved.
              </Text>
            </View>
          </View>
        )}

        {/* CASE 1: TODAY WORKOUT SKIPPED OR COMPLETED BANNER */}
        {todaySession?.isTodaySkipped ? (
          <View className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <View className="flex-row items-center">
              <Ionicons name="play-skip-forward-circle" size={24} color="#D97706" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-extrabold text-amber-800">Today's Session Skipped ⏭️</Text>
                <Text className="text-xs text-amber-700 mt-0.5">
                  "{todaySession.dayTitle}" is rescheduled for tomorrow so you won't miss a workout day.
                </Text>
              </View>
            </View>
          </View>
        ) : todaySession?.isTodayCompleted ? (
          <View className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#059669" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-extrabold text-emerald-800">Today's Workout Complete! 🎉</Text>
                <Text className="text-xs text-emerald-700 mt-0.5">Great job staying consistent. Rest & recover for tomorrow!</Text>
              </View>
            </View>
          </View>
        ) : (
          /* CASE 2: TODAY WORKOUT NOT COMPLETED ACTION BUTTONS */
          <View className="mt-5 flex-row flex-wrap justify-between">
            {todaySession ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleStartWorkoutSession(todaySession)}
                  className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl bg-[#017374] py-3.5 shadow-md border border-[#017374]/20">
                  <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-extrabold text-white">Start Workout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    Alert.alert(
                      "Skip Today's Session",
                      `Skip "${todaySession.dayTitle}" for today? This workout will be rescheduled for tomorrow so you won't lose your routine progress.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Skip Session',
                          style: 'destructive',
                          onPress: async () => {
                            const res = await useWorkoutPlanStore.getState().skipTodaySession();
                            if (res.success) {
                              Alert.alert('Session Skipped ⏭️', `"${res.skippedDayTitle}" was rescheduled for tomorrow.`);
                            }
                          },
                        },
                      ]
                    );
                  }}
                  className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3.5">
                  <Ionicons name="play-skip-forward" size={16} color="#D97706" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-bold text-amber-700">Skip Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation?.navigate('WorkoutPlans')}
                  className="w-full flex-row items-center justify-center rounded-2xl border border-[#017374]/20 bg-[#D8F3EB] py-3">
                  <Ionicons name="list-outline" size={16} color="#014041" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-bold text-[#014041]">Manage Plan & Calendar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    const quickSessionData = {
                      planId: 'custom-freestyle',
                      planName: 'Freestyle Workout',
                      dayNumber: 1,
                      dayTitle: 'Quick Workout Session',
                      isRestDay: false,
                      targetMuscles: ['Full Body'],
                      exercises: [],
                    };
                    handleStartWorkoutSession(quickSessionData);
                  }}
                  className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl bg-[#017374] py-3.5 shadow-md border border-[#017374]/20">
                  <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-extrabold text-white">Start Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation?.navigate('CreateEditWorkoutPlan')}
                  className="w-[48%] mb-2 flex-row items-center justify-center rounded-2xl border border-[#017374]/40 bg-[#017374]/15 py-3.5">
                  <Ionicons name="add" size={18} color="#017374" style={{ marginRight: 6 }} />
                  <Text className="text-xs font-bold text-[#017374]">Create Plan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* TOMORROW'S WORKOUT INDICATOR CARD (Shown when today's workout is done/skipped OR for upcoming preview) */}
      {tomorrowSession && (
        <View className="mt-5 rounded-3xl border border-[#017374]/20 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="rounded-xl bg-[#017374]/15 p-2 mr-2.5">
                <Ionicons name="calendar-sharp" size={20} color="#017374" />
              </View>
              <View>
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

          <View className="mt-3 flex-row items-center justify-between pt-3 border-t border-[#017374]/10">
            <Text className="text-xs text-[#025C5D] font-medium">
              {tomorrowSession.isRestDay
                ? '😴 Active Recovery & Rest Day'
                : `Target: ${tomorrowSession.targetMuscles?.join(', ') || 'Muscle Group'} • ${tomorrowSession.exercises?.length || 0} exercises`}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('WorkoutPlans')}
              className="flex-row items-center">
              <Text className="text-xs font-bold text-[#017374] mr-0.5">Details</Text>
              <Ionicons name="chevron-forward" size={14} color="#017374" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* DAILY REMINDER TIME BAR */}
      <View className="mt-5 flex-row items-center justify-between rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="rounded-2xl bg-[#017374]/15 p-3 mr-3">
            <Ionicons name="alarm-outline" size={22} color="#017374" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-extrabold text-[#014041]">Daily Workout Reminder</Text>
            <Text className="text-[11px] text-[#3A7574] mt-0.5">Scheduled for: <Text className="font-bold text-[#017374]">{reminderTime}</Text></Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleTestNotification}
            className="rounded-xl border border-[#017374]/20 bg-[#EBF7F4] p-2.5 mr-2">
            <Ionicons name="notifications" size={16} color="#017374" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTimeModal(true)}
            className="rounded-xl bg-[#017374] px-3 py-2 shadow-xs border border-[#017374]/20">
            <Text className="text-xs font-bold text-white">Set Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* REMINDER TIME PICKER MODAL */}
      <Modal visible={showTimeModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="w-full bg-white rounded-3xl p-6 border border-[#017374]/20 shadow-xl">
            <View className="flex-row justify-between items-center pb-3 border-b border-[#017374]/15">
              <Text className="text-lg font-black text-[#014041]">Daily Reminder Timing</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close-circle" size={24} color="#3A7574" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-[#3A7574] my-3">
              Select your preferred daily workout time to receive push notification reminders for today's scheduled routine:
            </Text>

            {reminderOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={async () => {
                  await setReminderTime(opt.value);
                  setShowTimeModal(false);
                  Alert.alert('Reminder Updated ⏰', `Daily reminder set for ${opt.label}!`);
                }}
                className={`flex-row justify-between items-center p-3.5 my-1 rounded-2xl border ${
                  reminderTime === opt.value
                    ? 'border-[#017374] bg-[#017374]/15'
                    : 'border-[#017374]/15 bg-[#EBF7F4]/40'
                }`}>
                <Text className="text-sm font-bold text-[#014041]">{opt.label}</Text>
                {reminderTime === opt.value && (
                  <Ionicons name="checkmark-circle" size={18} color="#017374" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowTimeModal(false)}
              className="mt-4 rounded-2xl border border-[#017374]/20 bg-[#EBF7F4] py-3 items-center">
              <Text className="text-xs font-bold text-[#014041]">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WORKOUT PLAN SECTION */}
      <View className="mt-7 flex-row items-center justify-between">
        <Text className="text-xl font-black text-[#014041]">Active Workout Routine</Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate('WorkoutPlans')}
          className="flex-row items-center">
          <Text className="text-xs font-bold text-[#017374] mr-1">View All Plans</Text>
          <Ionicons name="chevron-forward" size={14} color="#017374" />
        </TouchableOpacity>
      </View>

      {/* WORKOUT PLAN SUMMARY CARD */}
      <View className="mt-3 rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-sm">
        {activePlan ? (
          <>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <View className="rounded-xl bg-[#017374]/15 p-2.5 border border-[#017374]/25 mr-3">
                  <MaterialCommunityIcons name="arm-flex" size={24} color="#017374" />
                </View>
                <View>
                  <Text className="text-base font-extrabold text-[#014041]">
                    {activePlan.name}
                  </Text>
                  <Text className="text-xs text-[#025C5D]">
                    {activePlan.splitDays || 6}-Day Split • {activePlan.goal || 'Build Muscle'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleExportPDF}
                className="rounded-2xl border border-[#017374]/15 bg-[#EBF7F4] p-3">
                <Ionicons name="share-outline" size={18} color="#017374" />
              </TouchableOpacity>
            </View>

            {/* DAY PREVIEW STRIP */}
            <View className="mt-4 border-t border-[#017374]/10 pt-3">
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#3A7574]">
                Split Days Overview
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {(activePlan.days || []).map((d) => {
                  const isToday = todaySession && todaySession.dayNumber === d.dayNumber;
                  const isTodaySkipped = isToday && todaySession?.isTodaySkipped;
                  const isTodayCompleted = isToday && todaySession?.isTodayCompleted;

                  return (
                    <TouchableOpacity
                      key={d.dayNumber}
                      onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activePlan })}
                      className={`mr-2 rounded-xl border px-3 py-2 ${
                        isTodaySkipped
                          ? 'border-amber-500 bg-amber-500/15'
                          : isTodayCompleted
                          ? 'border-emerald-500 bg-emerald-500/15'
                          : isToday
                          ? 'border-[#017374] bg-[#017374]/15'
                          : 'border-[#017374]/15 bg-[#EBF7F4]'
                      }`}>
                      <Text
                        className={`text-[10px] font-extrabold ${
                          isTodaySkipped
                            ? 'text-amber-700'
                            : isTodayCompleted
                            ? 'text-emerald-700'
                            : isToday
                            ? 'text-[#017374]'
                            : 'text-[#025C5D]'
                        }`}>
                        D{d.dayNumber}: {d.isRestDay ? 'Rest 😴' : d.title} {isTodaySkipped ? ' (Skipped ⏭️)' : isTodayCompleted ? ' (Done ✓)' : isToday ? ' (Today 🎯)' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View className="mt-4 flex-row space-x-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
                className="flex-1 rounded-2xl bg-[#017374]/15 border border-[#017374]/30 py-3 items-center mr-2">
                <Text className="text-xs font-bold text-[#017374]">+ Create New Plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activePlan })}
                className="flex-1 rounded-2xl bg-[#D8F3EB] border border-[#017374]/15 py-3 items-center">
                <Text className="text-xs font-bold text-[#014041]">Plan Details</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="py-4 items-center">
            <MaterialCommunityIcons name="clipboard-plus-outline" size={40} color="#3A7574" />
            <Text className="mt-2 text-base font-extrabold text-[#014041]">No Active Workout Routine</Text>
            <Text className="mt-1 text-xs text-[#025C5D] text-center px-4">
              Build your custom split plan. Recommended presets (6-Day PPL, 4-Day Upper/Lower) can be loaded in 1-click when creating a plan!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEditWorkoutPlan')}
              className="mt-4 flex-row items-center rounded-2xl bg-[#017374] px-5 py-3 shadow-md border border-[#017374]/20">
              <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text className="text-xs font-extrabold text-white">+ Create Workout Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* STATS GRID */}
      <View className="mt-6 flex-row justify-between">
        {/* Calories */}
        <View className="w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-[#3A7574]">Calories Burned</Text>
            <View className="rounded-xl bg-orange-500/10 p-2">
              <MaterialCommunityIcons name="fire" size={20} color="#F97316" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">
            {analytics?.totalCalories || 480}
          </Text>
          <Text className="mt-1 text-xs font-medium text-[#017374]">kCal total</Text>
        </View>

        {/* Streak */}
        <View className="w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-[#3A7574]">Current Streak</Text>
            <View className="rounded-xl bg-[#017374]/15 p-2">
              <Ionicons name="flash" size={20} color="#017374" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">
            {analytics?.streak || 5} <Text className="text-lg">Days</Text>
          </Text>
          <Text className="mt-1 text-xs font-medium text-[#017374]">On fire! 🔥</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text className="mb-4 mt-8 text-xl font-black text-[#014041]">Quick Actions</Text>

      <View className="flex-row flex-wrap justify-between">
        {quickActionIcons.map((action, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => {
              if (action.action) action.action();
              else if (action.route) navigation?.navigate(action.route);
            }}
            className="mb-4 w-[48%] flex-row items-center rounded-2xl border border-[#017374]/15 bg-white p-4 shadow-sm">
            <View className="rounded-xl bg-[#EBF7F4] p-3.5 border border-[#017374]/10">
              {action.icon}
            </View>
            <Text className="ml-3 text-sm font-bold text-[#014041] flex-1">{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
