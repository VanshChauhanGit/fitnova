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

  const plan = planParam || activePlan;
  const isActive = (activePlan?.id === plan?.id) || (activePlan?._id === plan?._id) || plan?.isActive;

  const [selectedDayNum, setSelectedDayNum] = useState(1);

  if (!plan) {
    return (
      <View className="flex-1 bg-[#0B0E14] items-center justify-center p-5">
        <Text className="text-white text-lg">No Workout Plan selected.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-xl bg-[#10B981] px-5 py-3">
          <Text className="font-bold text-[#0B0E14]">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDayObj = (plan.days || []).find((d) => d.dayNumber === selectedDayNum) || plan.days?.[0];

  const handleExportPDF = () => {
    exportPlanToPDF(plan, user?.name || 'Athlete');
  };

  const handleToggleActive = async () => {
    const planId = plan.id || plan._id;
    const res = await useWorkoutPlanStore.getState().toggleActivePlan(planId);
    if (res.success) {
      if (res.isActive) {
        Alert.alert('Plan Activated', `"${plan.name}" is now set as your active tracking plan.`);
      } else {
        Alert.alert('Plan Deactivated', `"${plan.name}" was deactivated.`);
      }
    }
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
    <View className="flex-1 bg-[#0B0E14] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-slate-800">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-2.5">
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-white" numberOfLines={1}>
          {plan.name}
        </Text>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={handleExportPDF}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 mr-2">
            <Ionicons name="share-outline" size={20} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan })}
            className="rounded-2xl border border-slate-800 bg-[#151B26] p-2.5">
            <Ionicons name="create-outline" size={20} color="#F8FAFC" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        {/* HERO CARD */}
        <View className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#151B26] p-6 shadow-xl">
          <View className="flex-row items-center justify-between">
            <View className="rounded-full bg-emerald-500/10 px-3.5 py-1 border border-emerald-500/30">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
                {plan.goal || 'Build Muscle'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleActive}
              className={`flex-row items-center rounded-full px-3.5 py-1 border ${
                isActive
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-slate-800 border-slate-700'
              }`}>
              <Ionicons
                name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={isActive ? '#10B981' : '#94A3B8'}
              />
              <Text
                className={`ml-1 text-xs font-extrabold ${
                  isActive ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                {isActive ? 'ACTIVE PLAN (Tap to Deactivate)' : 'Set Active'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-2xl font-black text-white">{plan.name}</Text>
          <Text className="mt-1 text-xs text-slate-400">
            {plan.description || 'Comprehensive muscle building & progression split routine.'}
          </Text>

          <View className="mt-4 flex-row items-center justify-between border-t border-slate-800/80 pt-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
              <Text className="ml-1.5 text-xs font-semibold text-slate-300">
                {plan.splitDays || plan.days?.length || 6}-Day Split Cycle
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleExportPDF}
              className="flex-row items-center rounded-xl bg-emerald-500 px-3 py-1.5">
              <Ionicons name="document-text-outline" size={16} color="#0B0E14" />
              <Text className="ml-1 text-xs font-bold text-[#0B0E14]">Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DAY SELECTOR TABS */}
        <View className="mt-7">
          <Text className="mb-3 text-base font-black text-white">Program Routine Days</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {(plan.days || []).map((d) => (
              <TouchableOpacity
                key={d.dayNumber}
                onPress={() => setSelectedDayNum(d.dayNumber)}
                className={`mr-2.5 rounded-2xl border px-4 py-3 ${
                  selectedDayNum === d.dayNumber
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-800 bg-[#151B26]'
                }`}>
                <Text
                  className={`text-xs font-extrabold ${
                    selectedDayNum === d.dayNumber ? 'text-[#0B0E14]' : 'text-slate-300'
                  }`}>
                  Day {d.dayNumber} {d.isRestDay ? '😴' : '💪'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* DAY DETAILS CARD */}
        {currentDayObj && (
          <View className="mt-5 rounded-3xl border border-slate-800 bg-[#151B26] p-5 shadow-lg">
            <View className="flex-row items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <View className="flex-row items-center">
                <View className="mr-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 px-2.5 py-1">
                  <Text className="text-xs font-extrabold text-[#10B981]">
                    DAY {currentDayObj.dayNumber}
                  </Text>
                </View>
                <Text className="text-base font-bold text-white">{currentDayObj.title}</Text>
              </View>
            </View>

            {/* TARGET MUSCLES TAGS */}
            {currentDayObj.targetMuscles?.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {currentDayObj.targetMuscles.map((m) => (
                  <View
                    key={m}
                    className="mr-2 mb-1.5 rounded-lg bg-slate-800 px-2.5 py-1 border border-slate-700">
                    <Text className="text-xs font-semibold text-cyan-400">🎯 {m}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentDayObj.isRestDay ? (
              <View className="py-8 items-center justify-center">
                <MaterialCommunityIcons name="moon-full" size={40} color="#64748B" />
                <Text className="mt-3 text-base font-bold text-slate-300">Rest & Recovery Day</Text>
                <Text className="mt-1 text-xs text-slate-500 text-center px-6">
                  Rest is when your muscles rebuild and grow. Eat clean, stay hydrated!
                </Text>
              </View>
            ) : (
              <View>
                <Text className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Target Exercises ({currentDayObj.exercises?.length || 0})
                </Text>

                {currentDayObj.exercises?.map((ex, idx) => (
                  <View
                    key={ex.exerciseId || idx}
                    className="mb-3 rounded-2xl border border-slate-800 bg-[#0B0E14] p-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-extrabold text-white">
                        {idx + 1}. {ex.name}
                      </Text>
                      <View className="rounded-lg bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                        <Text className="text-xs font-bold text-emerald-400">{ex.bodyPart}</Text>
                      </View>
                    </View>

                    <View className="mt-2.5 flex-row items-center space-x-4">
                      <Text className="text-xs font-semibold text-slate-300">
                        📊 <Text className="font-bold text-white">{ex.sets}</Text> sets
                      </Text>
                      <Text className="text-xs font-semibold text-slate-300">
                        🔁 <Text className="font-bold text-white">{ex.reps}</Text> reps
                      </Text>
                      <Text className="text-xs font-semibold text-slate-300">
                        ⏱️ <Text className="font-bold text-white">{ex.restTime || 60}s</Text> rest
                      </Text>
                    </View>

                    {ex.notes ? (
                      <View className="mt-2.5 rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                        <Text className="text-xs text-slate-400">💡 {ex.notes}</Text>
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
            <Text className="text-xs font-bold text-red-400">Delete Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEditWorkoutPlan', { plan })}
            className="flex-row items-center rounded-2xl bg-[#151B26] border border-slate-800 px-5 py-3.5">
            <Ionicons name="create-outline" size={18} color="#F8FAFC" style={{ marginRight: 6 }} />
            <Text className="text-xs font-bold text-white">Edit Program</Text>
          </TouchableOpacity>
        </View>

        <View className="h-28" />
      </ScrollView>
    </View>
  );
}
