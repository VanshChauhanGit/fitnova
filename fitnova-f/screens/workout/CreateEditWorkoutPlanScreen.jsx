import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import useWorkoutPlanStore, { PRESET_SPLITS } from '../../store/workoutPlanStore';

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Calves',
  'Glutes',
  'Abs',
  'Forearms',
  'Cardio',
];

const SPLIT_PRESETS_OPTIONS = [
  { label: '4-Day Split', value: 4 },
  { label: '6-Day Split', value: 6 },
  { label: '7-Day Split', value: 7 },
];

export default function CreateEditWorkoutPlanScreen({ route, navigation }) {
  const editPlan = route?.params?.plan || null;
  const createPlanStore = useWorkoutPlanStore((state) => state.createPlan);
  const updatePlanStore = useWorkoutPlanStore((state) => state.updatePlan);

  const [name, setName] = useState(editPlan?.name || '');
  const [description, setDescription] = useState(editPlan?.description || '');
  const [goal, setGoal] = useState(editPlan?.goal || 'Build Muscle');
  const [isActive, setIsActive] = useState(editPlan?.isActive ?? true);
  const [days, setDays] = useState(
    editPlan?.days || generateInitialDays(6)
  );

  const [activeDayTab, setActiveDayTab] = useState(1);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // New exercise form states
  const [exName, setExName] = useState('');
  const [exBodyPart, setExBodyPart] = useState('Chest');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10-12');
  const [exRest, setExRest] = useState('60');
  const [exNotes, setExNotes] = useState('');

  function generateInitialDays(count) {
    const list = [];
    for (let i = 1; i <= count; i++) {
      let isRest = false;
      let title = `Day ${i} Workout`;
      let muscles = ['Chest', 'Triceps'];

      if (count === 6) {
        if (i === 1) { title = 'Push A (Chest Focus)'; muscles = ['Chest', 'Shoulders', 'Triceps']; }
        else if (i === 2) { title = 'Pull A (Back Focus)'; muscles = ['Back', 'Biceps']; }
        else if (i === 3) { title = 'Legs A (Quads & Calves)'; muscles = ['Quads', 'Calves']; }
        else if (i === 4) { title = 'Push B (Shoulder Focus)'; muscles = ['Shoulders', 'Chest', 'Triceps']; }
        else if (i === 5) { title = 'Pull B (Lat Width & Biceps)'; muscles = ['Back', 'Biceps']; }
        else if (i === 6) { title = 'Legs B (Hamstrings & Abs)'; muscles = ['Hamstrings', 'Abs']; }
      } else if (count === 4) {
        if (i === 1) { title = 'Upper Body A'; muscles = ['Chest', 'Back', 'Arms']; }
        else if (i === 2) { title = 'Lower Body A'; muscles = ['Quads', 'Hamstrings']; }
        else if (i === 3) { title = 'Upper Body B'; muscles = ['Shoulders', 'Back', 'Triceps']; }
        else if (i === 4) { title = 'Lower Body B'; muscles = ['Hamstrings', 'Glutes', 'Abs']; }
      } else if (count === 7) {
        if (i === 7) { title = 'Rest & Recovery Day'; isRest = true; muscles = ['Rest']; }
      }

      list.push({
        dayNumber: i,
        title,
        isRestDay: isRest,
        targetMuscles: muscles,
        exercises: [],
      });
    }
    return list;
  }

  const handleSplitCountChange = (count) => {
    if (days.length === count) return;
    if (days.length > count) {
      Alert.alert(
        'Change Days Split',
        `Adjusting to ${count} days will trim the last ${days.length - count} day(s). Proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed',
            onPress: () => {
              setDays(days.slice(0, count));
              if (activeDayTab > count) setActiveDayTab(count);
            },
          },
        ]
      );
    } else {
      const newDays = [...days];
      for (let i = days.length + 1; i <= count; i++) {
        newDays.push({
          dayNumber: i,
          title: i === 7 ? 'Rest & Recovery' : `Day ${i} Workout`,
          isRestDay: i === 7,
          targetMuscles: ['General'],
          exercises: [],
        });
      }
      setDays(newDays);
    }
  };

  const loadPresetTemplate = (presetId) => {
    const preset = PRESET_SPLITS.find((p) => p.id === presetId);
    if (!preset) return;
    setName(preset.name);
    setDescription(preset.description);
    setGoal(preset.goal);
    setDays(JSON.parse(JSON.stringify(preset.days)));
    setActiveDayTab(1);
  };

  const currentDayObj = days.find((d) => d.dayNumber === activeDayTab) || days[0];

  const updateCurrentDay = (updatedFields) => {
    setDays(
      days.map((d) => (d.dayNumber === activeDayTab ? { ...d, ...updatedFields } : d))
    );
  };

  const handleAddExercise = () => {
    if (!exName.trim()) {
      Alert.alert('Required Field', 'Please enter exercise name.');
      return;
    }

    const newEx = {
      exerciseId: 'ex-' + Date.now(),
      name: exName.trim(),
      bodyPart: exBodyPart,
      sets: parseInt(exSets) || 3,
      reps: exReps || '10-12',
      restTime: parseInt(exRest) || 60,
      notes: exNotes,
    };

    const updatedExercises = [...(currentDayObj.exercises || []), newEx];
    updateCurrentDay({ exercises: updatedExercises });

    // Reset inputs
    setExName('');
    setExNotes('');
    setIsExerciseModalOpen(false);
  };

  const handleDeleteExercise = (exId) => {
    const updated = currentDayObj.exercises.filter((ex) => ex.exerciseId !== exId);
    updateCurrentDay({ exercises: updated });
  };

  const handleSavePlan = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please give your workout plan a title.');
      return;
    }

    const planPayload = {
      name: name.trim(),
      description: description.trim(),
      goal,
      isActive,
      days,
    };

    let result;
    if (editPlan) {
      result = await updatePlanStore(editPlan.id || editPlan._id, planPayload);
    } else {
      result = await createPlanStore(planPayload);
    }

    if (result.success) {
      Alert.alert(
        'Success! 🎉',
        `Workout plan "${name}" ${editPlan ? 'updated' : 'created'} successfully!`
      );
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message || 'Failed to save workout plan.');
    }
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
        <Text className="text-lg font-bold text-white">
          {editPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
        </Text>
        <TouchableOpacity
          onPress={handleSavePlan}
          className="rounded-xl bg-[#10B981] px-4 py-2.5">
          <Text className="font-bold text-[#0B0E14]">Save Plan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* PRESET SPLIT SELECTION BUTTONS */}
        {!editPlan && (
          <View className="mb-6 rounded-2xl border border-slate-800 bg-[#151B26] p-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ⚡ Quick Preset Split Templates
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
              {PRESET_SPLITS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => loadPresetTemplate(p.id)}
                  className="mr-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2">
                  <Text className="text-xs font-bold text-emerald-400">{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PLAN NAME & DESCRIPTION */}
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plan Title
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. 6-Day Hypertrophy PPL"
              placeholderTextColor="#64748B"
              className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-base font-bold text-white"
            />
          </View>

          <View className="mt-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description / Notes
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Target progressive overload on heavy compound lifts."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={2}
              className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-sm text-white"
            />
          </View>
        </View>

        {/* GOAL & ACTIVE STATUS TOGGLE */}
        <View className="mt-5 flex-row justify-between">
          <View className="w-[48%]">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary Goal
            </Text>
            <View className="rounded-2xl border border-slate-800 bg-[#151B26] p-1.5">
              {['Build Muscle', 'Gain Strength', 'Fat Loss'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGoal(g)}
                  className={`rounded-xl py-2 px-3 ${
                    goal === g ? 'bg-[#10B981]' : 'bg-transparent'
                  }`}>
                  <Text
                    className={`text-xs font-bold text-center ${
                      goal === g ? 'text-[#0B0E14]' : 'text-slate-400'
                    }`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="w-[48%] rounded-2xl border border-slate-800 bg-[#151B26] p-4 justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Plan Status
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-xs font-bold text-white">
                {isActive ? 'Active Plan' : 'Inactive'}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#334155', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SPLIT DURATION SELECTOR (4, 6, 7 Days) */}
        <View className="mt-6">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Split Days Length
          </Text>
          <View className="flex-row space-x-3">
            {SPLIT_PRESETS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleSplitCountChange(opt.value)}
                className={`flex-1 rounded-2xl border py-3 px-2 mr-2 items-center ${
                  days.length === opt.value
                    ? 'border-[#10B981] bg-[#10B981]/15'
                    : 'border-slate-800 bg-[#151B26]'
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    days.length === opt.value ? 'text-[#10B981]' : 'text-slate-400'
                  }`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DAY-BY-DAY TAB BAR */}
        <View className="mt-7">
          <Text className="mb-3 text-base font-black text-white">Day-by-Day Routine Builder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {days.map((d) => (
              <TouchableOpacity
                key={d.dayNumber}
                onPress={() => setActiveDayTab(d.dayNumber)}
                className={`mr-2.5 rounded-2xl border px-4 py-3 flex-row items-center ${
                  activeDayTab === d.dayNumber
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-800 bg-[#151B26]'
                }`}>
                <Text
                  className={`text-xs font-extrabold ${
                    activeDayTab === d.dayNumber ? 'text-[#0B0E14]' : 'text-slate-300'
                  }`}>
                  Day {d.dayNumber} {d.isRestDay ? '😴' : '💪'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ACTIVE DAY EDITING SECTION */}
        {currentDayObj && (
          <View className="mt-5 rounded-3xl border border-slate-800 bg-[#151B26] p-5 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Editing Day {currentDayObj.dayNumber}
              </Text>

              <View className="flex-row items-center">
                <Text className="mr-2 text-xs font-medium text-slate-400">Rest Day</Text>
                <Switch
                  value={currentDayObj.isRestDay}
                  onValueChange={(val) => updateCurrentDay({ isRestDay: val })}
                  trackColor={{ false: '#334155', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* DAY TITLE */}
            <Text className="mb-1 text-xs font-semibold text-slate-400">Routine Title</Text>
            <TextInput
              value={currentDayObj.title}
              onChangeText={(txt) => updateCurrentDay({ title: txt })}
              placeholder="e.g. Push A (Chest & Triceps)"
              placeholderTextColor="#64748B"
              className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-3.5 text-sm font-bold text-white mb-4"
            />

            {currentDayObj.isRestDay ? (
              <View className="py-8 items-center justify-center">
                <MaterialCommunityIcons name="bed-clock" size={48} color="#64748B" />
                <Text className="mt-3 text-base font-bold text-slate-300">
                  Active Recovery & Rest Day
                </Text>
                <Text className="mt-1 text-xs text-slate-500 text-center px-6">
                  No exercise logging required for rest days. Prioritize hydration & sleep!
                </Text>
              </View>
            ) : (
              <View>
                {/* EXERCISES LIST FOR THIS DAY */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-bold text-white">
                    Exercises ({currentDayObj.exercises?.length || 0})
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsExerciseModalOpen(true)}
                    className="flex-row items-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5">
                    <Ionicons name="add" size={16} color="#10B981" />
                    <Text className="ml-1 text-xs font-bold text-emerald-400">Add Exercise</Text>
                  </TouchableOpacity>
                </View>

                {currentDayObj.exercises?.length === 0 ? (
                  <View className="rounded-2xl border border-dashed border-slate-800 p-6 items-center">
                    <Ionicons name="barbell-outline" size={32} color="#64748B" />
                    <Text className="mt-2 text-xs font-semibold text-slate-400">
                      No exercises added yet for Day {currentDayObj.dayNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsExerciseModalOpen(true)}
                      className="mt-3 rounded-xl bg-[#10B981] px-4 py-2">
                      <Text className="text-xs font-bold text-[#0B0E14]">+ Add First Exercise</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  currentDayObj.exercises.map((ex, idx) => (
                    <View
                      key={ex.exerciseId || idx}
                      className="mb-3 flex-row items-center justify-between rounded-2xl border border-slate-800 bg-[#0B0E14] p-3.5">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center space-x-2">
                          <Text className="text-xs font-bold text-emerald-400">#{idx + 1}</Text>
                          <Text className="text-sm font-bold text-white">{ex.name}</Text>
                        </View>
                        <Text className="mt-0.5 text-xs text-slate-400">
                          {ex.sets} sets • {ex.reps} reps • {ex.restTime || 60}s rest ({ex.bodyPart})
                        </Text>
                        {ex.notes ? (
                          <Text className="mt-1 text-xs italic text-slate-500">
                            💡 {ex.notes}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteExercise(ex.exerciseId)}
                        className="rounded-xl bg-red-500/10 p-2 border border-red-500/20">
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* ADD EXERCISE MODAL */}
      <Modal visible={isExerciseModalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/80">
          <View className="rounded-t-3xl border-t border-slate-800 bg-[#151B26] p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
              <Text className="text-lg font-bold text-white">Add Exercise to Day {activeDayTab}</Text>
              <TouchableOpacity onPress={() => setIsExerciseModalOpen(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              <Text className="mb-1 text-xs font-semibold text-slate-400">Exercise Name *</Text>
              <TextInput
                value={exName}
                onChangeText={setExName}
                placeholder="e.g. Barbell Bench Press, Lat Pulldown"
                placeholderTextColor="#64748B"
                className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-4 text-sm font-bold text-white mb-4"
              />

              <Text className="mb-1 text-xs font-semibold text-slate-400">Target Muscle Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                {MUSCLE_GROUPS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setExBodyPart(m)}
                    className={`mr-2 rounded-xl px-3 py-2 border ${
                      exBodyPart === m
                        ? 'border-[#10B981] bg-[#10B981]'
                        : 'border-slate-800 bg-[#0B0E14]'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        exBodyPart === m ? 'text-[#0B0E14]' : 'text-slate-400'
                      }`}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row justify-between mb-4">
                <View className="w-[30%]">
                  <Text className="mb-1 text-xs font-semibold text-slate-400">Target Sets</Text>
                  <TextInput
                    value={exSets}
                    onChangeText={setExSets}
                    keyboardType="numeric"
                    className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-3.5 text-sm font-bold text-white text-center"
                  />
                </View>
                <View className="w-[33%]">
                  <Text className="mb-1 text-xs font-semibold text-slate-400">Target Reps</Text>
                  <TextInput
                    value={exReps}
                    onChangeText={setExReps}
                    placeholder="10-12"
                    placeholderTextColor="#64748B"
                    className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-3.5 text-sm font-bold text-white text-center"
                  />
                </View>
                <View className="w-[30%]">
                  <Text className="mb-1 text-xs font-semibold text-slate-400">Rest (sec)</Text>
                  <TextInput
                    value={exRest}
                    onChangeText={setExRest}
                    keyboardType="numeric"
                    className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-3.5 text-sm font-bold text-white text-center"
                  />
                </View>
              </View>

              <Text className="mb-1 text-xs font-semibold text-slate-400">Form Notes / Cue</Text>
              <TextInput
                value={exNotes}
                onChangeText={setExNotes}
                placeholder="e.g. Squeeze lats, control eccentric 3s"
                placeholderTextColor="#64748B"
                className="rounded-2xl border border-slate-800 bg-[#0B0E14] p-4 text-xs text-white mb-6"
              />

              <TouchableOpacity
                onPress={handleAddExercise}
                className="rounded-2xl bg-[#10B981] py-4 items-center mb-6">
                <Text className="text-base font-bold text-[#0B0E14]">Add to Day {activeDayTab}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
