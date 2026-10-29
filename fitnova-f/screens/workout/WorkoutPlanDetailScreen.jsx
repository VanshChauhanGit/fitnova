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
      <View className="flex-1 bg-[#121417] items-center justify-center p-5">
        <Text className="text-[#E8EAED] text-lg font-bold">No Workout Plan selected.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-xl bg-[#2D9CDB] px-5 py-3 shadow-sm">
          <Text className="font-black text-[#121417]">Go Back</Text>
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
    <View className="flex-1 bg-[#121417] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-[#2D333B]">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-[#2D333B] bg-[#1F2328] p-2.5 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#E8EAED" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-[#E8EAED]" numberOfLines={1}>
          {plan.name}
        </Text>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleExportPDF}
            className="rounded-2xl border border-[#2D9CDB]/30 bg-[#2D9CDB]/15 p-2.5 mr-2">
            <Ionicons name="share-outline" size={20} color="#2D9CDB" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan })}
            className="rounded-2xl border border-[#2D333B] bg-[#1F2328] p-2.5 shadow-sm">
            <Ionicons name="create-outline" size={20} color="#E8EAED" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        {/* HERO CARD */}
        <View className="overflow-hidden rounded-3xl border border-[#2D333B] bg-[#1F2328] p-6 shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-[#2D9CDB]/15 px-3.5 py-1 border border-[#2D9CDB]/30">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#2D9CDB]">
                {plan.goal || 'Build Muscle'}
              </Text>
            </View>

            {isActive ? (
              <View className="flex-row items-center rounded-full bg-[#2D9CDB] px-3.5 py-1 border border-[#2D9CDB]">
                <Ionicons name="checkmark-circle" size={14} color="#121417" />
                <Text className="ml-1 text-xs font-black text-[#121417]">ACTIVE PLAN</Text>
              </View>
            ) : (
              <View className="flex-row items-center rounded-full bg-[#16191E] px-3.5 py-1 border border-[#2D333B]">
                <Ionicons name="ellipse-outline" size={12} color="#9AA0A6" />
                <Text className="ml-1 text-xs font-bold text-[#9AA0A6]">Inactive</Text>
              </View>
            )}
          </View>

          <Text className="mt-4 text-2xl font-black text-[#E8EAED]">{plan.name}</Text>
          <Text className="mt-1 text-xs text-[#9AA0A6]">
            {plan.description || 'Comprehensive muscle building & progression split routine.'}
          </Text>

          <View className="mt-4 flex-row items-center justify-between border-t border-[#2D333B] pt-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#9AA0A6" />
              <Text className="ml-1.5 text-xs font-semibold text-[#9AA0A6]">
                {plan.splitDays || plan.days?.length || 6}-Day Split Cycle
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleExportPDF}
              className="flex-row items-center rounded-xl bg-[#2D9CDB] px-3 py-1.5 border border-[#2D9CDB]/30 shadow-sm">
              <Ionicons name="document-text-outline" size={16} color="#121417" />
              <Text className="ml-1 text-xs font-black text-[#121417]">Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DAY SELECTOR TABS */}
        <View className="mt-7">
          <Text className="mb-3 text-base font-black text-[#E8EAED]">Program Routine Days</Text>
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
                      ? 'border-[#2D9CDB] bg-[#2D9CDB]'
                      : isTodaySkipped
                      ? 'border-[#F2C94C] bg-[#F2C94C]/15 shadow-sm'
                      : isTodayCompleted
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                      : 'border-[#2D333B] bg-[#1F2328] shadow-sm'
                  }`}>
                  <Text
                    className={`text-xs font-extrabold ${
                      selectedDayNum === d.dayNumber
                        ? 'text-[#121417] font-black'
                        : isTodaySkipped
                        ? 'text-[#F2C94C]'
                        : isTodayCompleted
                        ? 'text-emerald-400'
                        : 'text-[#9AA0A6]'
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
          <View className="mt-5 rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-md">
            {isActive && todaySession && todaySession.dayNumber === currentDayObj.dayNumber && todaySession.isTodaySkipped && (
              <View className="mb-4 flex-row items-center rounded-2xl border border-[#F2C94C]/30 bg-[#F2C94C]/10 p-3.5">
                <Ionicons name="play-skip-forward-circle" size={22} color="#F2C94C" />
                <View className="ml-2.5 flex-1">
                  <Text className="text-xs font-extrabold text-[#F2C94C]">Today's Session Skipped ⏭️</Text>
                  <Text className="text-[11px] text-[#9AA0A6]">This workout is rescheduled for tomorrow so your split stays on track.</Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center justify-between border-b border-[#2D333B] pb-3 mb-4">
              <View className="flex-row items-center">
                <View className="mr-2.5 rounded-xl bg-[#2D9CDB]/15 border border-[#2D9CDB]/25 px-2.5 py-1">
                  <Text className="text-xs font-extrabold text-[#2D9CDB]">
                    DAY {currentDayObj.dayNumber}
                  </Text>
                </View>
                <Text className="text-base font-bold text-[#E8EAED]">{currentDayObj.title}</Text>
              </View>
            </View>

            {/* TARGET MUSCLES TAGS */}
            {currentDayObj.targetMuscles?.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {currentDayObj.targetMuscles.map((m) => (
                  <View
                    key={m}
                    className="mr-2 mb-1.5 rounded-lg bg-[#16191E] px-2.5 py-1 border border-[#2D333B]">
                    <Text className="text-xs font-semibold text-[#2D9CDB]">🎯 {m}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentDayObj.isRestDay ? (
              <View className="py-8 items-center justify-center">
                <MaterialCommunityIcons name="moon-full" size={40} color="#9AA0A6" />
                <Text className="mt-3 text-base font-bold text-[#E8EAED]">Rest & Recovery Day</Text>
                <Text className="mt-1 text-xs text-[#9AA0A6] text-center px-6">
                  Rest is when your muscles rebuild and grow. Eat clean, stay hydrated!
                </Text>
              </View>
            ) : (
              <View>
                <Text className="mb-3 text-xs font-extrabold uppercase tracking-wider text-[#9AA0A6]">
                  Target Exercises ({currentDayObj.exercises?.length || 0})
                </Text>

                {currentDayObj.exercises?.map((ex, idx) => (
                  <View
                    key={ex.exerciseId || idx}
                    className="mb-3 rounded-2xl border border-[#2D333B] bg-[#16191E] p-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-extrabold text-[#E8EAED]">
                        {idx + 1}. {ex.name}
                      </Text>
                      <View className="rounded-lg bg-[#2D9CDB]/15 px-2 py-0.5 border border-[#2D9CDB]/25">
                        <Text className="text-xs font-bold text-[#2D9CDB]">{ex.bodyPart}</Text>
                      </View>
                    </View>

                    <View className="mt-2.5 flex-row items-center space-x-4">
                      <Text className="text-xs font-semibold text-[#9AA0A6]">
                        📊 <Text className="font-bold text-[#E8EAED]">{ex.sets}</Text> sets
                      </Text>
                      <Text className="text-xs font-semibold text-[#9AA0A6]">
                        🔁 <Text className="font-bold text-[#E8EAED]">{ex.reps}</Text> reps
                      </Text>
                      <Text className="text-xs font-semibold text-[#9AA0A6]">
                        ⏱️ <Text className="font-bold text-[#E8EAED]">{ex.restTime || 60}s</Text> rest
                      </Text>
                    </View>

                    {ex.notes ? (
                      <View className="mt-2.5 rounded-xl bg-[#1F2328] p-2.5 border border-[#2D333B]">
                        <Text className="text-xs text-[#9AA0A6]">💡 {ex.notes}</Text>
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
            className="flex-row items-center rounded-2xl bg-[#1F2328] border border-[#2D333B] px-5 py-3.5 shadow-sm">
            <Ionicons name="create-outline" size={18} color="#E8EAED" style={{ marginRight: 6 }} />
            <Text className="text-xs font-bold text-[#E8EAED]">Edit Program</Text>
          </TouchableOpacity>
        </View>

        <View className="h-28" />
      </ScrollView>
    </View>
  );
}
