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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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

const REPS_PRESETS = ['6-8', '8-10', '10-12', '12-15', '15-20'];
const REST_PRESETS = [45, 60, 90, 120, 180];

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
      sets: parseInt(exSets, 10) || 3,
      reps: exReps || '10-12',
      restTime: parseInt(exRest, 10) || 60,
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
    <View className="flex-1 bg-[#EBF7F4] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-[#017374]/15">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-row items-center rounded-xl border border-[#017374]/20 bg-white px-3 py-2 shadow-xs">
          <Ionicons name="arrow-back" size={18} color="#017374" />
          <Text className="ml-1 text-xs font-bold text-[#017374]">Back</Text>
        </TouchableOpacity>

        <View className="items-center flex-1 mx-2">
          <Text className="text-[10px] font-extrabold text-[#017374] uppercase tracking-wider">ROUTINE PLAN BUILDER</Text>
          <Text className="text-base font-black text-[#014041]" numberOfLines={1}>
            {editPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSavePlan}
          className="flex-row items-center rounded-full bg-[#017374] px-4 py-2 shadow-md border border-[#017374]/20 active:opacity-90">
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-white uppercase tracking-wider">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* PRESET SPLIT SELECTION BUTTONS */}
        {!editPlan && (
          <View className="mb-5 rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-[#017374]">
              ⚡ QUICK PRESET SPLIT TEMPLATES
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row">
              {PRESET_SPLITS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => loadPresetTemplate(p.id)}
                  className="mr-2.5 rounded-full border border-[#017374]/30 bg-[#F0F9F6] px-4 py-2 active:bg-[#017374] active:border-[#017374]">
                  <Text className="text-xs font-black text-[#017374]">{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PLAN NAME & DESCRIPTION */}
        <View className="space-y-4">
          <View>
            <Text className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
              Plan Title *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. 6-Day Hypertrophy PPL"
              placeholderTextColor="#3A7574"
              className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-base font-black text-[#014041] shadow-xs"
            />
          </View>

          <View className="mt-4">
            <Text className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
              Description / Routine Notes
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Target progressive overload on heavy compound lifts."
              placeholderTextColor="#3A7574"
              multiline
              numberOfLines={2}
              className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-sm font-semibold text-[#014041] shadow-xs"
            />
          </View>
        </View>

        {/* GOAL & ACTIVE STATUS TOGGLE */}
        <View className="mt-5 flex-row justify-between gap-3">
          <View className="w-[48%]">
            <Text className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
              Primary Goal
            </Text>
            <View className="rounded-2xl border border-[#017374]/20 bg-white p-1.5 shadow-xs">
              {['Build Muscle', 'Gain Strength', 'Fat Loss'].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGoal(g)}
                  className={`rounded-xl py-2 px-3 mb-1 ${
                    goal === g ? 'bg-[#017374] shadow-xs' : 'bg-transparent'
                  }`}>
                  <Text
                    className={`text-xs font-black text-center ${
                      goal === g ? 'text-white' : 'text-[#3A7574]'
                    }`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="w-[48%] rounded-2xl border border-[#017374]/20 bg-white p-4 justify-between shadow-xs">
            <View>
              <Text className="text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
                Plan Status
              </Text>
              <Text className="text-xs font-semibold text-[#3A7574] mt-1">
                Toggle as your main workout routine
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#017374]/10">
              <Text className="text-xs font-black text-[#014041]">
                {isActive ? 'Active Plan' : 'Inactive'}
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#D1EFE7', true: '#017374' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SPLIT DURATION SELECTOR (4, 6, 7 Days) */}
        <View className="mt-6">
          <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
            Split Days Length
          </Text>
          <View className="flex-row gap-2">
            {SPLIT_PRESETS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleSplitCountChange(opt.value)}
                className={`flex-1 rounded-full border py-3 items-center ${
                  days.length === opt.value
                    ? 'border-[#017374] bg-[#017374] shadow-sm'
                    : 'border-[#017374]/20 bg-white shadow-xs'
                }`}>
                <Text
                  className={`text-xs font-black ${
                    days.length === opt.value ? 'text-white' : 'text-[#3A7574]'
                  }`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DAY-BY-DAY TAB BAR */}
        <View className="mt-7">
          <Text className="mb-3 text-base font-black text-[#014041]">Day-by-Day Routine Builder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {days.map((d) => (
              <TouchableOpacity
                key={d.dayNumber}
                onPress={() => setActiveDayTab(d.dayNumber)}
                className={`mr-2.5 rounded-full border px-4 py-3 flex-row items-center ${
                  activeDayTab === d.dayNumber
                    ? 'border-[#017374] bg-[#017374] shadow-sm'
                    : 'border-[#017374]/20 bg-white shadow-xs'
                }`}>
                <Text
                  className={`text-xs font-black ${
                    activeDayTab === d.dayNumber ? 'text-white' : 'text-[#025C5D]'
                  }`}>
                  Day {d.dayNumber} {d.isRestDay ? '😴' : '💪'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ACTIVE DAY EDITING SECTION */}
        {currentDayObj && (
          <View className="mt-5 rounded-3xl border border-[#017374]/20 bg-white p-5 shadow-sm mb-10">
            <View className="flex-row items-center justify-between pb-3 border-b border-[#017374]/10 mb-4">
              <Text className="text-xs font-extrabold uppercase tracking-widest text-[#017374]">
                Editing Day {currentDayObj.dayNumber}
              </Text>

              <View className="flex-row items-center">
                <Text className="mr-2 text-xs font-extrabold text-[#3A7574]">Rest Day</Text>
                <Switch
                  value={currentDayObj.isRestDay}
                  onValueChange={(val) => updateCurrentDay({ isRestDay: val })}
                  trackColor={{ false: '#D1EFE7', true: '#017374' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* DAY TITLE */}
            <Text className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">Routine Title</Text>
            <TextInput
              value={currentDayObj.title}
              onChangeText={(txt) => updateCurrentDay({ title: txt })}
              placeholder="e.g. Push A (Chest & Triceps)"
              placeholderTextColor="#3A7574"
              className="rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] p-3.5 text-sm font-black text-[#014041] mb-4"
            />

            {currentDayObj.isRestDay ? (
              <View className="py-8 items-center justify-center">
                <MaterialCommunityIcons name="bed-clock" size={48} color="#3A7574" />
                <Text className="mt-3 text-base font-black text-[#025C5D]">
                  Active Recovery & Rest Day
                </Text>
                <Text className="mt-1 text-xs font-semibold text-[#3A7574] text-center px-6">
                  No exercise logging required for rest days. Prioritize hydration & sleep!
                </Text>
              </View>
            ) : (
              <View>
                {/* EXERCISES LIST FOR THIS DAY */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-black text-[#014041]">
                    Exercises ({currentDayObj.exercises?.length || 0})
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsExerciseModalOpen(true)}
                    className="flex-row items-center rounded-full bg-[#017374] px-3.5 py-2 shadow-xs">
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text className="ml-1 text-xs font-black text-white uppercase tracking-wider">Add Exercise</Text>
                  </TouchableOpacity>
                </View>

                {!Array.isArray(currentDayObj?.exercises) || currentDayObj.exercises.length === 0 ? (
                  <View className="rounded-2xl border border-dashed border-[#017374]/30 p-6 items-center bg-[#F0F9F6]">
                    <Ionicons name="barbell-outline" size={32} color="#3A7574" />
                    <Text className="mt-2 text-xs font-extrabold text-[#3A7574]">
                      No exercises added yet for Day {currentDayObj.dayNumber}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsExerciseModalOpen(true)}
                      className="mt-3 rounded-full bg-[#017374] px-4 py-2.5 shadow-sm active:opacity-90">
                      <Text className="text-xs font-black text-white uppercase tracking-wider">+ Add First Exercise</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  currentDayObj.exercises.map((ex, idx) => (
                    <View
                      key={ex.exerciseId || idx}
                      className="mb-3 flex-row items-center justify-between rounded-2xl border border-[#017374]/15 bg-[#F0F9F6] p-3.5 shadow-xs">
                      <View className="flex-1 mr-3">
                        <View className="flex-row items-center space-x-2">
                          <View className="h-6 w-6 rounded-lg bg-[#017374]/15 items-center justify-center mr-1">
                            <Text className="text-xs font-black text-[#017374]">#{idx + 1}</Text>
                          </View>
                          <Text className="text-sm font-black text-[#014041]">{ex.name}</Text>
                        </View>
                        <Text className="mt-1 text-xs font-bold text-[#025C5D]">
                          {ex.sets} sets • {ex.reps} reps • {ex.restTime || 60}s rest ({ex.bodyPart})
                        </Text>
                        {ex.notes ? (
                          <Text className="mt-1 text-xs italic font-semibold text-[#3A7574]">
                            💡 {ex.notes}
                          </Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteExercise(ex.exerciseId)}
                        className="rounded-xl bg-red-500/10 p-2.5 border border-red-500/20 active:bg-red-500/20">
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* ADD EXERCISE MODAL POPUP */}
      <Modal visible={isExerciseModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-6 border-t border-[#017374]/20 shadow-2xl max-h-[90%]">
            {/* TOP DRAG HANDLE */}
            <View className="h-1.5 w-14 rounded-full bg-gray-300 self-center mb-4" />

            <View className="flex-row items-center justify-between pb-4 border-b border-[#017374]/10">
              <View>
                <Text className="text-[10px] font-extrabold text-[#017374]/70 uppercase tracking-widest mb-0.5">
                  EXERCISE CONFIGURATION
                </Text>
                <Text className="text-xl font-black text-[#014041]">
                  Add Exercise to Day {activeDayTab}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsExerciseModalOpen(false)}
                className="rounded-full bg-[#F0F9F6] p-2.5 active:bg-[#E2F4EE]">
                <Ionicons name="close" size={22} color="#014041" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {/* EXERCISE NAME */}
              <Text className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
                Exercise Name *
              </Text>
              <View className="flex-row items-center rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] px-4 py-1 mb-4 shadow-inner">
                <Ionicons name="barbell-outline" size={20} color="#017374" style={{ marginRight: 8 }} />
                <TextInput
                  value={exName}
                  onChangeText={setExName}
                  placeholder="e.g. Barbell Bench Press, Lat Pulldown"
                  placeholderTextColor="#3A7574"
                  className="flex-1 py-3 text-sm font-black text-[#014041]"
                />
              </View>

              {/* TARGET MUSCLE GROUP */}
              <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
                Target Muscle Group
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5">
                {MUSCLE_GROUPS.map((m) => {
                  const isSel = exBodyPart === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setExBodyPart(m)}
                      className={`mr-2 px-4 py-2.5 rounded-full border ${
                        isSel
                          ? 'border-[#017374] bg-[#017374] shadow-md'
                          : 'border-[#017374]/20 bg-[#F0F9F6]'
                      }`}>
                      <Text
                        className={`text-xs font-black ${
                          isSel ? 'text-white' : 'text-[#014041]'
                        }`}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* SETS, REPS & REST STATS */}
              <Text className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
                Sets, Reps & Rest Targets
              </Text>
              <View className="flex-row justify-between gap-2 mb-4">
                {/* SETS */}
                <View className="flex-1 rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] p-3 items-center">
                  <Text className="text-[9px] font-extrabold uppercase text-[#017374] mb-1">Target Sets</Text>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => setExSets(String(Math.max(1, (parseInt(exSets, 10) || 3) - 1)))}
                      className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15">
                      <Ionicons name="remove" size={14} color="#017374" />
                    </TouchableOpacity>
                    <Text className="text-base font-black text-[#014041] px-1">{exSets || '3'}</Text>
                    <TouchableOpacity
                      onPress={() => setExSets(String((parseInt(exSets, 10) || 3) + 1))}
                      className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15">
                      <Ionicons name="add" size={14} color="#017374" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* REPS */}
                <View className="flex-[1.2] rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] p-3 items-center">
                  <Text className="text-[9px] font-extrabold uppercase text-[#017374] mb-1">Target Reps</Text>
                  <TextInput
                    value={exReps}
                    onChangeText={setExReps}
                    placeholder="10-12"
                    placeholderTextColor="#3A7574"
                    className="text-base font-black text-[#014041] text-center w-full"
                  />
                </View>

                {/* REST */}
                <View className="flex-1 rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] p-3 items-center">
                  <Text className="text-[9px] font-extrabold uppercase text-[#017374] mb-1">Rest (sec)</Text>
                  <TextInput
                    value={exRest}
                    onChangeText={setExRest}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor="#3A7574"
                    className="text-base font-black text-[#014041] text-center w-full"
                  />
                </View>
              </View>

              {/* QUICK REPS PRESETS */}
              <View className="flex-row items-center gap-1.5 mb-4">
                <Text className="text-[10px] font-extrabold uppercase text-[#3A7574] mr-1">Reps Presets:</Text>
                {REPS_PRESETS.map((rp) => (
                  <TouchableOpacity
                    key={rp}
                    onPress={() => setExReps(rp)}
                    className={`px-2.5 py-1 rounded-lg border ${
                      exReps === rp ? 'border-[#017374] bg-[#017374]' : 'border-[#017374]/20 bg-[#F0F9F6]'
                    }`}>
                    <Text className={`text-[10px] font-black ${exReps === rp ? 'text-white' : 'text-[#017374]'}`}>{rp}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* FORM NOTES / CUES */}
              <Text className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3A7574]">
                Form Notes / Cue (Optional)
              </Text>
              <TextInput
                value={exNotes}
                onChangeText={setExNotes}
                placeholder="e.g. Squeeze lats, control eccentric 3s"
                placeholderTextColor="#3A7574"
                className="rounded-2xl border border-[#017374]/20 bg-[#F0F9F6] p-3.5 text-xs font-semibold text-[#014041] mb-6"
              />

              {/* ADD EXERCISE ACTION BUTTON */}
              <TouchableOpacity
                onPress={handleAddExercise}
                className="rounded-full bg-[#017374] py-4 items-center mb-6 shadow-lg shadow-[#017374]/40 active:opacity-90 flex-row justify-center">
                <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-sm font-black text-white uppercase tracking-widest">
                  ADD TO DAY {activeDayTab}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
