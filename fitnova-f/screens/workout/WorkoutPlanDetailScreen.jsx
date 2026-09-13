import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import useAuthStore from '../../store/authStore';
import { exportPlanToPDF } from '../../utils/pdfExporter';

export default function WorkoutPlanDetailScreen({ route, navigation }) {
  const planParam = route?.params?.plan;
  const user = useAuthStore((state) => state.user);
  const activePlan = useWorkoutPlanStore((state) => state.activePlan);
  const deletePlanStore = useWorkoutPlanStore((state) => state.deletePlan);
  const getTodayMappedSession = useWorkoutPlanStore((state) => state.getTodayMappedSession);

  const plan = planParam || activePlan;
  const isActive = (activePlan?.id === plan?.id) || (activePlan?._id === plan?._id) || plan?.isActive;
  const todaySession = isActive ? getTodayMappedSession() : null;

  const [selectedDayNum, setSelectedDayNum] = useState(1);

  if (!plan) {
    return (
      <View className="flex-1 bg-[#EBF7F4] items-center justify-center p-5">
        <Text className="text-[#014041] text-lg font-bold">No Workout Plan selected.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-xl bg-[#017374] px-5 py-3 border border-[#017374]/20 shadow-sm">
          <Text className="font-bold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDayObj = (plan.days || []).find((d) => d.dayNumber === selectedDayNum) || plan.days?.[0];

  const handleExportPDF = () => {
    exportPlanToPDF(plan, user?.name || 'Athlete');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout Plan',
      `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const planId = plan.id || plan._id;
            const res = await deletePlanStore(planId);
            if (res.success) {
              navigation.goBack();
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-[#017374]/20 bg-white p-2.5 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#014041" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#014041]" numberOfLines={1}>
          {plan.name}
        </Text>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleExportPDF}
            className="rounded-2xl border border-[#017374]/25 bg-[#017374]/15 p-2.5 mr-2">
            <Ionicons name="share-outline" size={20} color="#017374" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan })}
            className="rounded-2xl border border-[#017374]/20 bg-white p-2.5 shadow-sm">
            <Ionicons name="create-outline" size={20} color="#014041" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        {/* HERO CARD */}
        <View className="overflow-hidden rounded-3xl border border-[#017374]/20 bg-white p-6 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-[#017374]/15 px-3.5 py-1 border border-[#017374]/30">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#017374]">
                {plan.goal || 'Build Muscle'}
              </Text>
            </View>

            {isActive ? (
              <View className="flex-row items-center rounded-full bg-[#017374] px-3.5 py-1 border border-[#017374]">
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                <Text className="ml-1 text-xs font-extrabold text-white">ACTIVE PLAN</Text>
              </View>
            ) : (
              <View className="flex-row items-center rounded-full bg-[#EBF7F4] px-3.5 py-1 border border-[#017374]/15">
                <Ionicons name="ellipse-outline" size={12} color="#3A7574" />
                <Text className="ml-1 text-xs font-bold text-[#3A7574]">Inactive</Text>
              </View>
            )}
          </View>

          <Text className="mt-4 text-2xl font-black text-[#014041]">{plan.name}</Text>
          <Text className="mt-1 text-xs text-[#025C5D]">
            {plan.description || 'Comprehensive muscle building & progression split routine.'}
          </Text>

          <View className="mt-4 flex-row items-center justify-between border-t border-[#017374]/10 pt-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#3A7574" />
              <Text className="ml-1.5 text-xs font-semibold text-[#025C5D]">
                {plan.splitDays || plan.days?.length || 6}-Day Split Cycle
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleExportPDF}
              className="flex-row items-center rounded-xl bg-[#017374] px-3 py-1.5 border border-[#017374]/20 shadow-sm">
              <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
              <Text className="ml-1 text-xs font-bold text-white">Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DAY SELECTOR TABS */}
        <View className="mt-7">
          <Text className="mb-3 text-base font-black text-[#014041]">Program Routine Days</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {(plan.days || []).map((d) => {
              const isToday = isActive && todaySession && todaySession.dayNumber === d.dayNumber;
              const isTodaySkipped = isToday && todaySession?.isTodaySkipped;
              const isTodayCompleted = isToday && todaySession?.isTodayCompleted;

              return (
                <TouchableOpacity
                  key={d.dayNumber}
                  onPress={() => setSelectedDayNum(d.dayNumber)}
                  className={`mr-2.5 rounded-2xl border px-4 py-3 ${
                    selectedDayNum === d.dayNumber
                      ? 'border-[#017374] bg-[#017374]'
                      : isTodaySkipped
                      ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                      : isTodayCompleted
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                      : 'border-[#017374]/20 bg-white shadow-sm'
                  }`}>
                  <Text
                    className={`text-xs font-extrabold ${
                      selectedDayNum === d.dayNumber
                        ? 'text-white'
                        : isTodaySkipped
                        ? 'text-amber-700'
                        : isTodayCompleted
                        ? 'text-emerald-700'
                        : 'text-[#025C5D]'
                    }`}>
                    Day {d.dayNumber} {d.isRestDay ? '😴' : '💪'} {isTodaySkipped ? '⏭️' : isTodayCompleted ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DAY DETAILS CARD */}
        {currentDayObj && (
          <View className="mt-5 rounded-3xl border border-[#017374]/20 bg-white p-5 shadow-md">
            {isActive && todaySession && todaySession.dayNumber === currentDayObj.dayNumber && todaySession.isTodaySkipped && (
              <View className="mb-4 flex-row items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <Ionicons name="play-skip-forward-circle" size={22} color="#D97706" />
                <View className="ml-2.5 flex-1">
                  <Text className="text-xs font-extrabold text-amber-800">Today's Session Skipped ⏭️</Text>
                  <Text className="text-[11px] text-amber-700">This workout is rescheduled for tomorrow so your split stays on track.</Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center justify-between border-b border-[#017374]/15 pb-3 mb-4">
              <View className="flex-row items-center">
                <View className="mr-2.5 rounded-xl bg-[#017374]/15 border border-[#017374]/25 px-2.5 py-1">
                  <Text className="text-xs font-extrabold text-[#017374]">
                    DAY {currentDayObj.dayNumber}
                  </Text>
                </View>
                <Text className="text-base font-bold text-[#014041]">{currentDayObj.title}</Text>
              </View>
            </View>

            {/* TARGET MUSCLES TAGS */}
            {currentDayObj.targetMuscles?.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {currentDayObj.targetMuscles.map((m) => (
                  <View
                    key={m}
                    className="mr-2 mb-1.5 rounded-lg bg-[#EBF7F4] px-2.5 py-1 border border-[#017374]/15">
                    <Text className="text-xs font-semibold text-[#017374]">🎯 {m}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentDayObj.isRestDay ? (
              <View className="py-8 items-center justify-center">
                <MaterialCommunityIcons name="moon-full" size={40} color="#3A7574" />
                <Text className="mt-3 text-base font-bold text-[#025C5D]">Rest & Recovery Day</Text>
                <Text className="mt-1 text-xs text-[#3A7574] text-center px-6">
                  Rest is when your muscles rebuild and grow. Eat clean, stay hydrated!
                </Text>
              </View>
            ) : (
              <View>
                <Text className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#3A7574]">
                  Target Exercises ({currentDayObj.exercises?.length || 0})
                </Text>

                {currentDayObj.exercises?.map((ex, idx) => (
                  <View
                    key={ex.exerciseId || idx}
                    className="mb-3 rounded-2xl border border-[#017374]/15 bg-[#EBF7F4] p-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-extrabold text-[#014041]">
                        {idx + 1}. {ex.name}
                      </Text>
                      <View className="rounded-lg bg-[#017374]/15 px-2 py-0.5 border border-[#017374]/25">
                        <Text className="text-xs font-bold text-[#017374]">{ex.bodyPart}</Text>
                      </View>
                    </View>

                    <View className="mt-2.5 flex-row items-center space-x-4">
                      <Text className="text-xs font-semibold text-[#025C5D]">
                        📊 <Text className="font-bold text-[#014041]">{ex.sets}</Text> sets
                      </Text>
                      <Text className="text-xs font-semibold text-[#025C5D]">
                        🔁 <Text className="font-bold text-[#014041]">{ex.reps}</Text> reps
                      </Text>
                      <Text className="text-xs font-semibold text-[#025C5D]">
                        ⏱️ <Text className="font-bold text-[#014041]">{ex.restTime || 60}s</Text> rest
                      </Text>
                    </View>

                    {ex.notes ? (
                      <View className="mt-2.5 rounded-xl bg-white p-2.5 border border-[#017374]/15">
                        <Text className="text-xs text-[#3A7574]">💡 {ex.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* BOTTOM DANGER ZONE & EDIT BUTTONS */}
        <View className="mt-6 flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3.5">
            <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text className="text-xs font-bold text-red-500">Delete Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan })}
            className="flex-row items-center rounded-2xl bg-[#D8F3EB] border border-[#017374]/15 px-5 py-3.5">
            <Ionicons name="create-outline" size={18} color="#014041" style={{ marginRight: 6 }} />
            <Text className="text-xs font-bold text-[#014041]">Edit Program</Text>
          </TouchableOpacity>
        </View>

        <View className="h-28" />
      </ScrollView>
    </View>
  );
}
