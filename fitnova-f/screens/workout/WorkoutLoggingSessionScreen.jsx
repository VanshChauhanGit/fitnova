import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  PanResponder,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useWorkoutStore from '../../store/workoutStore';
import useWorkoutPlanStore from '../../store/workoutPlanStore';
import { unlockAudio } from '../../utils/alarm';

function SwipeableSetRow({
  setObj,
  exIdx,
  setIdx,
  toggleSetCompleted,
  stepWeight,
  stepReps,
  setPickerState,
  setPickerValue,
  removeSetFromExercise,
}) {
  const pan = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const closeSwipe = () => {
    setIsOpen(false);
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const openSwipe = () => {
    setIsOpen(true);
    Animated.spring(pan, {
      toValue: -56,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.3;
      },
      onPanResponderGrant: () => {
        pan.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          const val = Math.max(-65, gestureState.dx);
          pan.setValue(val);
          if (val < -20 && !isOpen) setIsOpen(true);
        } else if (gestureState.dx > 0) {
          const val = Math.min(0, (isOpen ? -56 : 0) + gestureState.dx);
          pan.setValue(val);
          if (val > -15 && isOpen) setIsOpen(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -15 || (isOpen && gestureState.dx < 20)) {
          openSwipe();
        } else {
          closeSwipe();
        }
      },
      onPanResponderTerminate: () => {
        closeSwipe();
      },
    })
  ).current;

  return (
    <View className="relative my-1.5 overflow-hidden rounded-2xl">
      {/* COMPACT RED DELETE BUTTON REVEALED BEHIND ROW */}
      <View className="absolute right-1 top-1 bottom-1 w-[52px] bg-red-500 rounded-xl items-center justify-center shadow-xs">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            closeSwipe();
            removeSetFromExercise(exIdx, setIdx);
          }}
          className="h-full w-full items-center justify-center">
          <Ionicons name="trash" size={18} color="#FFFFFF" />
          <Text className="text-[9px] font-black text-white mt-0.5 uppercase tracking-wider">Delete</Text>
        </TouchableOpacity>
      </View>

      {/* SWIPEABLE FOREGROUND SET ROW */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: pan }] }}
        className={`p-2.5 rounded-2xl border flex-row items-center justify-between ${setObj?.completed
          ? 'border-[#017374]/35 bg-[#DDF3EE]'
          : 'border-[#017374]/15 bg-white shadow-xs'
          }`}>
        {/* IF SWIPED OPEN, OVERLAY SHOWS CANCEL DELETE & DISMISSES SWIPE ON TAP */}
        {isOpen && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={closeSwipe}
            className="absolute inset-0 z-50 bg-black/15 rounded-2xl flex-row items-center justify-center px-2">
            <View className="bg-white px-3 py-1.5 rounded-xl border border-[#017374]/30 shadow-lg flex-row items-center">
              <Ionicons name="close-circle" size={16} color="#017374" style={{ marginRight: 4 }} />
              <Text className="text-xs font-extrabold text-[#014041]">Cancel Delete</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* SET NUMBER BADGE */}
        <View className="h-8 w-8 rounded-xl bg-[#017374]/15 items-center justify-center border border-[#017374]/20 mr-1.5">
          <Text className="text-xs font-black text-[#014041]">S{setObj?.setNum || (setIdx + 1)}</Text>
        </View>

        {/* TACTILE WEIGHT STEPPER + PICKER TRIGGER CONTROL */}
        <View className="flex-1 mx-1 flex-row items-center justify-between rounded-xl bg-[#EBF7F4]/60 border border-[#017374]/20 p-1">
          <TouchableOpacity
            onPress={() => stepWeight(exIdx, setIdx, -2.5)}
            className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15 active:bg-[#017374]/20">
            <Ionicons name="remove" size={14} color="#017374" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setPickerState({ exIndex: exIdx, setIndex: setIdx, field: 'weight' });
              setPickerValue(String(setObj?.weight ?? '0'));
            }}
            className="flex-1 items-center px-1">
            <Text className="text-sm font-black text-[#014041]">
              {setObj?.weight ?? '0'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => stepWeight(exIdx, setIdx, 2.5)}
            className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15 active:bg-[#017374]/20">
            <Ionicons name="add" size={14} color="#017374" />
          </TouchableOpacity>
        </View>

        {/* TACTILE REPS STEPPER + PICKER TRIGGER CONTROL */}
        <View className="flex-1 mr-1.5 flex-row items-center justify-between rounded-xl bg-[#EBF7F4]/60 border border-[#017374]/20 p-1">
          <TouchableOpacity
            onPress={() => stepReps(exIdx, setIdx, -1)}
            className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15 active:bg-[#017374]/20">
            <Ionicons name="remove" size={14} color="#017374" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setPickerState({ exIndex: exIdx, setIndex: setIdx, field: 'reps' });
              setPickerValue(String(setObj?.reps ?? '10'));
            }}
            className="flex-1 items-center px-1">
            <Text className="text-sm font-black text-[#014041]">
              {setObj?.reps ?? '10'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => stepReps(exIdx, setIdx, 1)}
            className="h-7 w-7 rounded-lg bg-white items-center justify-center border border-[#017374]/15 active:bg-[#017374]/20">
            <Ionicons name="add" size={14} color="#017374" />
          </TouchableOpacity>
        </View>

        {/* CHECKMARK DONE BUTTON */}
        <TouchableOpacity
          onPress={() => toggleSetCompleted(exIdx, setIdx)}
          className={`h-9 w-9 rounded-xl items-center justify-center border shadow-xs ${setObj?.completed
            ? 'border-emerald-600 bg-[#017374]'
            : 'border-[#017374]/30 bg-white'
            }`}>
          <Ionicons
            name="checkmark"
            size={18}
            color={setObj?.completed ? '#FFFFFF' : '#017374'}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function WorkoutLoggingSessionScreen({ route, navigation }) {
  const { session: routeSession } = route?.params || {};

  const saveWorkout = useWorkoutStore((state) => state.saveWorkout);
  const startSession = useWorkoutStore((state) => state.startSession);
  const updateActiveSession = useWorkoutStore((state) => state.updateActiveSession);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const markDayComplete = useWorkoutPlanStore((state) => state.markDayComplete);

  const [saving, setSaving] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  const [customInputSeconds, setCustomInputSeconds] = useState('60');

  // Add Exercise Modal state
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('All');
  const [customExName, setCustomExName] = useState('');
  const [customExBodyPart, setCustomExBodyPart] = useState('Chest');

  // Quick Preset Picker Modal State: { exIndex, setIndex, field: 'weight'|'reps' }
  const [pickerState, setPickerState] = useState(null);
  const [pickerValue, setPickerValue] = useState('');

  const DEFAULT_EXERCISE_LIBRARY = [
    { name: 'Barbell Bench Press', bodyPart: 'Chest' },
    { name: 'Incline Dumbbell Press', bodyPart: 'Chest' },
    { name: 'Dumbbell Flyes', bodyPart: 'Chest' },
    { name: 'Push-ups', bodyPart: 'Chest' },
    { name: 'Dips', bodyPart: 'Chest' },
    { name: 'Barbell Bent Over Row', bodyPart: 'Back' },
    { name: 'Lat Pulldown', bodyPart: 'Back' },
    { name: 'Seated Cable Row', bodyPart: 'Back' },
    { name: 'Single-Arm Dumbbell Row', bodyPart: 'Back' },
    { name: 'Pull-ups', bodyPart: 'Back' },
    { name: 'Barbell Deadlift', bodyPart: 'Back' },
    { name: 'Overhead Dumbbell Press', bodyPart: 'Shoulders' },
    { name: 'Military Overhead Press', bodyPart: 'Shoulders' },
    { name: 'Lateral Raises', bodyPart: 'Shoulders' },
    { name: 'Face Pulls', bodyPart: 'Shoulders' },
    { name: 'Barbell Bicep Curl', bodyPart: 'Biceps' },
    { name: 'Incline Dumbbell Curls', bodyPart: 'Biceps' },
    { name: 'Hammer Curls', bodyPart: 'Biceps' },
    { name: 'Triceps Rope Pushdowns', bodyPart: 'Triceps' },
    { name: 'Skull Crushers', bodyPart: 'Triceps' },
    { name: 'Tricep Extension', bodyPart: 'Triceps' },
    { name: 'Barbell Back Squat', bodyPart: 'Quads' },
    { name: 'Leg Press', bodyPart: 'Quads' },
    { name: 'Leg Extension', bodyPart: 'Quads' },
    { name: 'Romanian Deadlift (RDL)', bodyPart: 'Hamstrings' },
    { name: 'Lying Leg Curls', bodyPart: 'Hamstrings' },
    { name: 'Standing Calf Raises', bodyPart: 'Calves' },
    { name: 'Hanging Leg Raises', bodyPart: 'Abs' },
    { name: 'Plank', bodyPart: 'Abs' },
    { name: 'Treadmill Running', bodyPart: 'Cardio' },
  ];

  // Initialize or attach to global persistent session
  useEffect(() => {
    if (!activeSession && routeSession) {
      startSession(routeSession);
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation?.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else if (navigation?.navigate) {
        navigation.navigate('Tabs');
      }
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const sessionInfo = activeSession?.sessionInfo || routeSession || { dayTitle: 'Workout Session' };
  const elapsedSeconds = activeSession?.elapsedSeconds || 0;
  const restSeconds = activeSession?.restSeconds || 0;
  const restActive = !!activeSession?.restActive;
  const restAlarmActive = !!activeSession?.restAlarmActive;
  const defaultRestTarget = activeSession?.defaultRestTarget || 60;
  const exerciseLogs = activeSession?.exerciseLogs || [];

  const dismissRestAlarm = useWorkoutStore((state) => state.dismissRestAlarm);
  const extendRestTimer = useWorkoutStore((state) => state.extendRestTimer);

  const handleAddExerciseToSession = (exName, exBodyPart) => {
    if (!exName || !exName.trim()) return;
    const name = exName.trim();
    const bodyPart = exBodyPart || 'General';

    const newExLog = {
      exerciseId: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      bodyPart,
      targetReps: '10',
      notes: '',
      sets: [
        { id: `set-${Date.now()}-1`, setNum: 1, weight: '0', reps: '10', completed: false },
        { id: `set-${Date.now()}-2`, setNum: 2, weight: '0', reps: '10', completed: false },
        { id: `set-${Date.now()}-3`, setNum: 3, weight: '0', reps: '10', completed: false },
      ],
    };

    const newLogs = [...exerciseLogs, newExLog];
    updateActiveSession({ exerciseLogs: newLogs });
    setShowAddExerciseModal(false);
    setExerciseSearchQuery('');
    setCustomExName('');
  };

  const removeExerciseFromSession = (exIndex) => {
    if (exIndex == null || !exerciseLogs?.[exIndex]) return;
    const targetEx = exerciseLogs[exIndex];
    Alert.alert(
      'Remove Exercise',
      `Remove "${targetEx.name}" from this workout session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newLogs = exerciseLogs.filter((_, i) => i !== exIndex);
            updateActiveSession({ exerciseLogs: newLogs });
          },
        },
      ]
    );
  };

  const startRestTimer = (seconds) => {
    const target = seconds !== undefined ? seconds : defaultRestTarget;
    updateActiveSession({
      restSeconds: target,
      restActive: true,
      defaultRestTarget: target,
    });
  };

  const pauseRestTimer = () => {
    updateActiveSession({ restActive: false });
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle set completed & trigger rest timer
  const toggleSetCompleted = (exIndex, setIndex) => {
    if (exIndex == null || setIndex == null || !exerciseLogs?.[exIndex]) return;
    const targetEx = exerciseLogs[exIndex];
    if (!targetEx?.sets || !targetEx.sets[setIndex]) return;

    const isNowCompleted = !targetEx.sets[setIndex].completed;

    const newLogs = exerciseLogs.map((ex, i) => {
      if (i !== exIndex) return ex;
      const targetSets = [...(ex.sets || [])];
      const updatedSet = { ...targetSets[setIndex], completed: isNowCompleted };
      targetSets[setIndex] = updatedSet;

      if (isNowCompleted) {
        for (let j = setIndex + 1; j < targetSets.length; j++) {
          if (!targetSets[j].completed && (targetSets[j].weight === '0' || targetSets[j].weight === '')) {
            targetSets[j] = {
              ...targetSets[j],
              weight: updatedSet.weight,
              reps: updatedSet.reps,
            };
          }
        }
      }

      return { ...ex, sets: targetSets };
    });

    const updates = { exerciseLogs: newLogs };
    if (isNowCompleted) {
      unlockAudio();
      updates.restSeconds = defaultRestTarget;
      updates.restActive = true;
    }
    updateActiveSession(updates);
  };

  // Safe Direct value update helper
  const setSetValue = (exIndex, setIndex, field, value) => {
    if (exIndex == null || setIndex == null || !field || !exerciseLogs?.[exIndex]) return;
    const newLogs = exerciseLogs.map((ex, i) => {
      if (i !== exIndex) return ex;
      const updatedSets = (ex.sets || []).map((s, j) => {
        if (j !== setIndex) return s;
        return { ...s, [field]: String(value) };
      });
      return { ...ex, sets: updatedSets };
    });
    updateActiveSession({ exerciseLogs: newLogs });
  };

  // Stepper adjustment for Weight (+2.5 / -2.5 kg)
  const stepWeight = (exIndex, setIndex, delta) => {
    if (exIndex == null || setIndex == null || !exerciseLogs?.[exIndex]) return;
    const targetSet = exerciseLogs[exIndex]?.sets?.[setIndex];
    if (!targetSet) return;
    const curW = parseFloat(targetSet.weight) || 0;
    const nextW = Math.max(0, Math.round((curW + delta) * 10) / 10);
    setSetValue(exIndex, setIndex, 'weight', nextW);
  };

  // Stepper adjustment for Reps (+1 / -1)
  const stepReps = (exIndex, setIndex, delta) => {
    if (exIndex == null || setIndex == null || !exerciseLogs?.[exIndex]) return;
    const targetSet = exerciseLogs[exIndex]?.sets?.[setIndex];
    if (!targetSet) return;
    const curR = parseInt(targetSet.reps, 10) || 0;
    const nextR = Math.max(1, curR + delta);
    setSetValue(exIndex, setIndex, 'reps', nextR);
  };

  // Add extra set to exercise
  const addSetToExercise = (exIndex) => {
    if (exIndex == null || !exerciseLogs?.[exIndex]) return;
    const newLogs = exerciseLogs.map((ex, i) => {
      if (i !== exIndex) return ex;
      const currentSets = ex.sets || [];
      const lastSet = currentSets[currentSets.length - 1];

      const newSet = {
        id: `set-${exIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        setNum: currentSets.length + 1,
        weight: lastSet ? lastSet.weight : '0',
        reps: lastSet ? lastSet.reps : '10',
        completed: false,
      };

      return { ...ex, sets: [...currentSets, newSet] };
    });
    updateActiveSession({ exerciseLogs: newLogs });
  };

  // Remove set from exercise
  const removeSetFromExercise = (exIndex, setIndex) => {
    if (exIndex == null || setIndex == null || !exerciseLogs?.[exIndex]) return;
    const targetEx = exerciseLogs[exIndex];
    if ((targetEx?.sets || []).length <= 1) {
      Alert.alert('Cannot Remove', 'Each exercise must have at least 1 set.');
      return;
    }
    const newLogs = exerciseLogs.map((ex, i) => {
      if (i !== exIndex) return ex;
      const filteredSets = (ex.sets || [])
        .filter((_, j) => j !== setIndex)
        .map((s, idx) => ({ ...s, setNum: idx + 1 }));
      return { ...ex, sets: filteredSets };
    });
    updateActiveSession({ exerciseLogs: newLogs });
  };

  // FINISH & SAVE WORKOUT SESSION
  const handleFinishWorkout = async () => {
    let completedSetsCount = 0;
    let totalVolume = 0;

    const formattedWorkoutExercises = exerciseLogs.map((ex) => {
      const completedSets = (ex.sets || []).filter((s) => s.completed);
      completedSetsCount += completedSets.length;

      const setsData = (ex.sets || []).map((s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (s.completed) {
          totalVolume += w * r;
        }
        return {
          reps: r,
          weight: w,
          completed: !!s.completed,
        };
      });

      return {
        exerciseId: ex.exerciseId,
        name: ex.name,
        bodyPart: ex.bodyPart,
        sets: setsData,
      };
    });

    if (completedSetsCount === 0) {
      Alert.alert(
        'No Sets Logged',
        'Please check off at least one completed set before finishing the workout.'
      );
      return;
    }

    setSaving(true);
    try {
      const workoutTitle = sessionInfo?.dayTitle || 'Workout Session';
      await saveWorkout(elapsedSeconds, formattedWorkoutExercises, workoutTitle);

      if (sessionInfo && typeof sessionInfo.dayIndex === 'number') {
        await markDayComplete(sessionInfo.dayIndex, `workout-${Date.now()}`);
      }

      setSaving(false);

      Alert.alert(
        'Workout Completed! 🎉',
        `Awesome work! You logged ${completedSetsCount} sets (${totalVolume} kg total volume) in ${formatTime(elapsedSeconds)}. Progress updated for today!`,
        [
          {
            text: 'View Progress',
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate('Tabs', { screen: 'Dashboard' });
              }
            },
          },
        ]
      );
    } catch (err) {
      setSaving(false);
      Alert.alert('Error', err.message || 'Failed to save workout session.');
    }
  };

  // Quick Presets
  const weightPresets = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  const repsPresets = [5, 6, 8, 10, 12, 15, 20, 25];
  const restPresets = [
    { label: '30 sec', sec: 30 },
    { label: '60 sec', sec: 60 },
    { label: '90 sec', sec: 90 },
    { label: '120 sec', sec: 120 },
    { label: '150 sec', sec: 150 },
    { label: '180 sec', sec: 180 },
  ];

  const activeSetObj =
    pickerState?.exIndex != null && pickerState?.setIndex != null
      ? exerciseLogs[pickerState.exIndex]?.sets?.[pickerState.setIndex] || null
      : null;

  return (
    <View className="flex-1 bg-[#EBF7F4] pt-14">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-5 pb-3 border-b border-[#017374]/15">
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation?.navigate) {
              navigation.navigate('Tabs');
            }
          }}
          className="flex-row items-center rounded-xl border border-[#017374]/20 bg-white px-3 py-2 shadow-xs">
          <Ionicons name="arrow-back" size={18} color="#017374" />
          <Text className="ml-1 text-xs font-bold text-[#017374]">Back</Text>
        </TouchableOpacity>

        <View className="items-center flex-1 mx-2">
          <Text className="text-[10px] font-extrabold text-[#017374] uppercase tracking-wider">ACTIVE WORKOUT LOG</Text>
          <Text className="text-base font-black text-[#014041]" numberOfLines={1}>
            {sessionInfo?.dayTitle || 'Workout Session'}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setShowAddExerciseModal(true)}
            className="flex-row items-center rounded-xl border border-[#017374]/25 bg-[#017374]/15 px-2.5 py-2 mr-2">
            <Ionicons name="add-circle-outline" size={16} color="#017374" />
            <Text className="ml-1 text-xs font-bold text-[#017374]">+ Ex</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFinishWorkout}
            disabled={saving}
            className="flex-row items-center rounded-xl bg-[#017374] px-3.5 py-2 shadow-sm border border-[#017374]/20">
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text className="text-xs font-black text-white">Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TIMERS DASHBOARD BAR */}
      <View className="flex-row justify-between px-5 mt-3 mb-2">
        {/* WORKOUT TIMER */}
        <View className="w-[48%] flex-row items-center justify-between rounded-2xl border border-[#017374]/15 bg-white p-3.5 shadow-xs">
          <View>
            <Text className="text-[10px] font-bold text-[#3A7574] uppercase">Workout Time</Text>
            <Text className="text-xl font-black text-[#017374] mt-0.5">{formatTime(elapsedSeconds)}</Text>
          </View>
          <Ionicons name="timer-outline" size={24} color="#017374" />
        </View>

        {/* REST TIMER CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowRestModal(true)}
          className="w-[48%] flex-row items-center justify-between rounded-2xl border border-[#017374]/15 bg-white p-3.5 shadow-xs">
          <View className="flex-1 mr-1">
            <View className="flex-row items-center space-x-1">
              <Text className="text-[10px] font-bold text-[#3A7574] uppercase">
                {restActive ? 'Resting...' : `Rest (${defaultRestTarget}s)`}
              </Text>
              <Ionicons name="pencil" size={10} color="#017374" />
            </View>

            <Text className={`text-xl font-black mt-0.5 ${restActive ? 'text-amber-600' : 'text-[#017374]'}`}>
              {formatTime(restActive ? restSeconds : defaultRestTarget)}
            </Text>
          </View>

          {restActive ? (
            <TouchableOpacity
              onPress={(e) => {
                e?.stopPropagation?.();
                pauseRestTimer();
              }}
              className="rounded-xl bg-[#017374]/15 p-2 active:bg-[#017374]/30">
              <Ionicons name="pause" size={18} color="#017374" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={(e) => {
                e?.stopPropagation?.();
                startRestTimer(defaultRestTarget);
              }}
              className="rounded-xl bg-[#017374] px-2.5 py-1.5 flex-row items-center active:opacity-80 shadow-xs">
              <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text className="text-[11px] font-black text-white uppercase">Start</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* EXERCISES & SETS LIST */}
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {exerciseLogs.length === 0 ? (
          <View className="my-6 rounded-3xl border border-dashed border-[#017374]/30 bg-white p-6 items-center shadow-xs">
            <View className="rounded-2xl bg-[#017374]/15 p-4 mb-3 border border-[#017374]/20">
              <Ionicons name="barbell-outline" size={36} color="#017374" />
            </View>
            <Text className="text-base font-black text-[#014041]">No Exercises Added Yet</Text>
            <Text className="text-xs text-[#025C5D] text-center mt-1 mb-5 px-3">
              Add exercises dynamically to this workout session to log your sets, reps, and weights!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowAddExerciseModal(true)}
              className="flex-row items-center rounded-2xl bg-[#017374] px-5 py-3.5 shadow-md border border-[#017374]/20">
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text className="text-xs font-extrabold text-white uppercase tracking-wider">+ Add Exercise to Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          exerciseLogs.map((ex, exIdx) => (
            <View
              key={ex.exerciseId ? `${ex.exerciseId}-${exIdx}` : `ex-${exIdx}`}
              className="mb-5 rounded-3xl border border-[#017374]/15 bg-white p-4">
              {/* EXERCISE HEADER */}
              <View className="flex-row items-center justify-between border-b border-[#017374]/10 pb-3">
                <View className="flex-1 mr-2">
                  <Text className="text-base font-black text-[#014041]">{ex.name}</Text>
                  <View className="flex-row items-center mt-1 space-x-2">
                    <View className="rounded-md bg-[#017374]/15 px-2 py-0.5 mr-2">
                      <Text className="text-[10px] font-bold text-[#017374] uppercase">{ex.bodyPart}</Text>
                    </View>
                    <Text className="text-[11px] font-semibold text-[#3A7574]">
                      Target: {ex.targetReps} reps
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => addSetToExercise(exIdx)}
                    className="flex-row items-center rounded-xl bg-[#017374]/10 px-2.5 py-1.5 border border-[#017374]/20 mr-1.5">
                    <Ionicons name="add" size={14} color="#017374" />
                    <Text className="ml-0.5 text-[11px] font-bold text-[#017374]">+ Set</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => removeExerciseFromSession(exIdx)}
                    className="rounded-xl bg-red-500/10 p-1.5 border border-red-500/20">
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TABLE COLUMN HEADERS */}
              <View className="flex-row items-center justify-between px-1 pt-3 pb-1">
                <Text className="w-8 text-[9px] font-black text-[#3A7574] text-center uppercase tracking-wider">SET</Text>
                <Text className="flex-1 text-[9px] font-black text-[#3A7574] text-center uppercase tracking-wider">WEIGHT (KG)</Text>
                <Text className="flex-1 text-[9px] font-black text-[#3A7574] text-center uppercase tracking-wider">REPS</Text>
                <Text className="w-9 text-[9px] font-black text-[#3A7574] text-center uppercase tracking-wider">DONE</Text>
              </View>

              {/* SETS LIST WITH SWIPEABLE ROWS */}
              {(ex.sets || []).map((setObj, setIdx) => (
                <SwipeableSetRow
                  key={setObj?.id ? `${setObj.id}-${setIdx}` : `set-${exIdx}-${setIdx}`}
                  setObj={setObj}
                  exIdx={exIdx}
                  setIdx={setIdx}
                  toggleSetCompleted={toggleSetCompleted}
                  stepWeight={stepWeight}
                  stepReps={stepReps}
                  setPickerState={setPickerState}
                  setPickerValue={setPickerValue}
                  removeSetFromExercise={removeSetFromExercise}
                />
              ))}
            </View>
          ))
        )}

        {exerciseLogs.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowAddExerciseModal(true)}
            className="mb-5 flex-row items-center justify-center rounded-2xl border border-dashed border-[#017374]/40 bg-[#017374]/10 py-3.5">
            <Ionicons name="add-circle-outline" size={18} color="#017374" style={{ marginRight: 6 }} />
            <Text className="text-xs font-bold text-[#017374]">+ Add Another Exercise</Text>
          </TouchableOpacity>
        )}

        {/* FINISH WORKOUT CARD AT BOTTOM */}
        <View className="mt-2 mb-16 p-5 rounded-3xl border border-[#017374]/20 bg-white items-center shadow-md">
          <Text className="text-base font-black text-[#014041]">Ready to log this workout?</Text>
          <Text className="text-xs text-[#3A7574] text-center mt-1 mb-4">
            Finishing will store your sets into workout history and update your overall workout stats!
          </Text>

          <TouchableOpacity
            onPress={handleFinishWorkout}
            disabled={saving}
            className="w-full flex-row items-center justify-center rounded-2xl bg-[#017374] py-4 shadow-md border border-[#017374]/20">
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-sm font-black text-white uppercase tracking-wider">Save & Finish Workout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* REST TIMER CONFIGURATION MODAL */}
      <Modal visible={showRestModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-6 border-t border-[#017374]/20 shadow-2xl">
            {/* TOP DRAG HANDLE */}
            <View className="h-1.5 w-14 rounded-full bg-gray-300 self-center mb-4" />

            <View className="flex-row items-center justify-between pb-4 border-b border-[#017374]/10">
              <View>
                <Text className="text-[10px] font-extrabold text-[#017374]/70 uppercase tracking-widest mb-0.5">
                  REST TIMER CONFIGURATION
                </Text>
                <Text className="text-xl font-black text-[#014041]">
                  Set Rest Duration
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowRestModal(false)}
                className="rounded-full bg-[#F0F9F6] p-2.5 active:bg-[#E2F4EE]">
                <Ionicons name="close" size={22} color="#014041" />
              </TouchableOpacity>
            </View>

            {/* MAIN TIMER STEPPER DISPLAY */}
            <View className="my-6 flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={() => {
                  const cur = parseInt(customInputSeconds, 10) || 60;
                  setCustomInputSeconds(String(Math.max(15, cur - 15)));
                }}
                className="h-16 w-16 rounded-full bg-[#F0F9F6] items-center justify-center border border-[#017374]/10 active:bg-[#E2F4EE]">
                <Ionicons name="remove" size={28} color="#017374" />
              </TouchableOpacity>

              <View className="items-center justify-center min-w-[160px] py-3 px-6 rounded-full bg-[#F0F9F6] border border-[#017374]/15 shadow-inner">
                <Text className="text-5xl font-black text-[#014041] text-center tracking-tight">
                  {formatTime(parseInt(customInputSeconds, 10) || 60)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const cur = parseInt(customInputSeconds, 10) || 60;
                  setCustomInputSeconds(String(cur + 15));
                }}
                className="h-16 w-16 rounded-full bg-[#F0F9F6] items-center justify-center border border-[#017374]/10 active:bg-[#E2F4EE]">
                <Ionicons name="add" size={28} color="#017374" />
              </TouchableOpacity>
            </View>

            {/* QUICK ADJUSTMENT STEPPERS */}
            <View className="flex-row justify-center gap-3 mb-6">
              {[-30, -15, 15, 30].map((step) => (
                <TouchableOpacity
                  key={step}
                  onPress={() => {
                    const cur = parseInt(customInputSeconds, 10) || 60;
                    setCustomInputSeconds(String(Math.max(15, cur + step)));
                  }}
                  className="px-3.5 py-2 flex-1 rounded-xl bg-[#F0F9F6] border border-[#017374]/15 active:bg-[#017374] active:border-[#017374]">
                  <Text className="text-xs text-center font-black text-[#017374]">
                    {step > 0 ? `+${step}s` : `${step}s`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PRESET PILLS GRID (3 PER ROW) */}
            <Text className="text-[11px] font-extrabold text-[#3A7574] mb-2 uppercase tracking-widest">
              Quick Rest Presets
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-2.5 mb-6">
              {restPresets.map((p) => {
                const isSelected = parseInt(customInputSeconds, 10) === p.sec;
                return (
                  <TouchableOpacity
                    key={p.sec}
                    onPress={() => setCustomInputSeconds(String(p.sec))}
                    className={`w-[31%] py-3 rounded-full border items-center justify-center ${isSelected
                      ? 'border-[#017374] bg-[#017374] shadow-md shadow-[#017374]/30'
                      : 'border-[#017374]/20 bg-[#F0F9F6]'
                      }`}>
                    <Text
                      className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#014041]'
                        }`}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SIDE-BY-SIDE ACTION BUTTONS */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => {
                  const sec = parseInt(customInputSeconds, 10) || 60;
                  updateActiveSession({ defaultRestTarget: sec });
                  setShowRestModal(false);
                  Alert.alert('Default Rest Set ⏱️', `Sets will automatically start a ${sec}s rest timer.`);
                }}
                className="flex-1 rounded-full bg-[#F0F9F6] border border-[#017374]/25 py-3.5 items-center active:bg-[#E2F4EE]">
                <Text className="text-xs font-black text-[#014041]">
                  Set Default ({customInputSeconds}s)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const sec = parseInt(customInputSeconds, 10) || 60;
                  startRestTimer(sec);
                  setShowRestModal(false);
                }}
                className="flex-1 rounded-full bg-[#017374] py-3.5 items-center shadow-md shadow-[#017374]/30 active:opacity-90 flex-row justify-center">
                <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-xs font-black text-white uppercase tracking-wider">
                  Start {customInputSeconds}s Timer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REST TIMER ALARM MODAL */}
      <Modal visible={restAlarmActive} transparent animationType="fade">
        <View className="flex-1 bg-black/75 justify-center items-center px-5">
          <View className="w-full bg-white rounded-3xl p-6 border-2 border-[#017374] shadow-2xl items-center">
            {/* ALARM ICON BADGE */}
            <View className="h-20 w-20 rounded-full bg-[#017374]/15 items-center justify-center mb-4 border-2 border-[#017374]/30 shadow-md">
              <Ionicons name="alarm" size={44} color="#017374" />
            </View>

            <View className="rounded-full bg-emerald-100 px-4 py-1.5 mb-2 border border-emerald-300">
              <Text className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                🚨 REST TIME COMPLETED!
              </Text>
            </View>

            <Text className="text-2xl font-black text-[#014041] text-center mb-1">
              Time For Your Next Set!
            </Text>

            <Text className="text-sm font-semibold text-[#3A7574] text-center mb-6 px-2">
              Your recovery period is over. Get back in position and smash your next set!
            </Text>

            <View className="w-full flex flex-col gap-2">
              <TouchableOpacity
                onPress={dismissRestAlarm}
                className="w-full rounded-full bg-[#017374] py-4 items-center shadow-lg shadow-[#017374]/40 active:opacity-90 flex-row justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-sm font-black text-white uppercase tracking-wider">
                  DISMISS & START SET
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => extendRestTimer(30)}
                className="w-full rounded-full bg-[#F0F9F6] border border-[#017374]/30 py-3.5 items-center active:bg-[#E2F4EE] flex-row justify-center">
                <Ionicons name="time-outline" size={18} color="#017374" style={{ marginRight: 6 }} />
                <Text className="text-xs font-bold text-[#014041]">
                  +30s Extra Rest
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QUICK PRESET PICKER MODAL FOR SET WEIGHT & REPS */}
      <Modal visible={pickerState !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-6 border-t border-[#017374]/20 shadow-2xl">
            {/* TOP DRAG HANDLE */}
            <View className="h-1.5 w-14 rounded-full bg-gray-300 self-center mb-4" />

            <View className="flex-row items-center justify-between pb-4 border-b border-[#017374]/10">
              <View>
                <Text className="text-[10px] font-extrabold text-[#017374]/70 uppercase tracking-widest mb-0.5">
                  QUICK PRESET PICKER
                </Text>
                <Text className="text-xl font-black text-[#014041]">
                  Select {pickerState?.field === 'weight' ? 'Weight (kg)' : 'Reps Target'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setPickerState(null)}
                className="rounded-full bg-[#F0F9F6] p-2.5 active:bg-[#E2F4EE]">
                <Ionicons name="close" size={22} color="#014041" />
              </TouchableOpacity>
            </View>

            {/* MAIN VALUE STEPPER DISPLAY */}
            <View className="my-6 flex-row items-center justify-center space-x-6">
              <TouchableOpacity
                onPress={() => {
                  if (pickerState?.field === 'weight') {
                    const cur = parseFloat(pickerValue) || 0;
                    setPickerValue(String(Math.max(0, Math.round((cur - 2.5) * 10) / 10)));
                  } else {
                    const cur = parseInt(pickerValue, 10) || 0;
                    setPickerValue(String(Math.max(1, cur - 1)));
                  }
                }}
                className="h-16 w-16 rounded-full bg-[#F0F9F6] items-center justify-center border border-[#017374]/10 active:bg-[#E2F4EE]">
                <Ionicons name="remove" size={32} color="#017374" />
              </TouchableOpacity>

              <View className="items-center justify-center min-w-[140px]">
                <Text className="text-5xl font-black text-[#014041]">
                  {pickerValue || '0'}
                </Text>
                <Text className="text-sm font-bold text-[#3A7574] mt-1 uppercase tracking-wider">
                  {pickerState?.field === 'weight' ? 'Kilograms' : 'Repetitions'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (pickerState?.field === 'weight') {
                    const cur = parseFloat(pickerValue) || 0;
                    setPickerValue(String(Math.round((cur + 2.5) * 10) / 10));
                  } else {
                    const cur = parseInt(pickerValue, 10) || 0;
                    setPickerValue(String(cur + 1));
                  }
                }}
                className="h-16 w-16 rounded-full bg-[#F0F9F6] items-center justify-center border border-[#017374]/10 active:bg-[#E2F4EE]">
                <Ionicons name="add" size={32} color="#017374" />
              </TouchableOpacity>
            </View>

            {/* FAST ADJUSTMENT BUTTONS */}
            <Text className="text-[11px] font-extrabold text-[#3A7574] mb-2 uppercase tracking-widest">Fast Adjustments</Text>
            <View className="flex-row gap-2 mb-5">
              {pickerState?.field === 'weight' ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.max(0, Math.round((cur - 5) * 10) / 10)));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">-5 kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.max(0, Math.round((cur - 2.5) * 10) / 10)));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">-2.5 kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.round((cur + 2.5) * 10) / 10));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">+2.5 kg</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseFloat(pickerValue) || 0;
                      setPickerValue(String(Math.round((cur + 5) * 10) / 10));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">+5 kg</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(Math.max(1, cur - 2)));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">-2 Reps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(Math.max(1, cur - 1)));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">-1 Rep</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(cur + 1));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">+1 Rep</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cur = parseInt(pickerValue, 10) || 0;
                      setPickerValue(String(cur + 2));
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#017374]/20 bg-[#F0F9F6] items-center active:bg-[#017374] active:border-[#017374]">
                    <Text className="text-sm font-bold text-[#017374]">+2 Reps</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* PRESET PILLS */}
            <Text className="text-[11px] font-extrabold text-[#3A7574] mb-2 uppercase tracking-widest">Common Presets</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {(pickerState?.field === 'weight' ? weightPresets : repsPresets).map((val) => {
                const isSelected =
                  pickerState?.field === 'weight'
                    ? parseFloat(pickerValue) === val
                    : parseInt(pickerValue, 10) === val;

                return (
                  <TouchableOpacity
                    key={val}
                    onPress={() => {
                      setPickerValue(String(val))
                    }}
                    className={`px-4 py-2.5 rounded-full border ${isSelected
                      ? 'border-[#017374] bg-[#017374] shadow-md'
                      : 'border-[#017374]/20 bg-[#F0F9F6]'
                      }`}>
                    <Text
                      className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-[#014041]'
                        }`}>
                      {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (pickerState?.exIndex != null && pickerState?.setIndex != null && pickerState?.field) {
                  setSetValue(pickerState.exIndex, pickerState.setIndex, pickerState.field, pickerValue);
                }
                setPickerState(null);
              }}
              className="rounded-full bg-[#017374] py-4 items-center shadow-lg shadow-[#017374]/40 active:opacity-80">
              <Text className="text-sm font-black text-white uppercase tracking-widest">CONFIRM ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DYNAMIC ADD EXERCISE MODAL */}
      <Modal visible={showAddExerciseModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-6 border-t border-[#017374]/20 shadow-2xl h-[80%]">
            <View className="h-1.5 w-14 rounded-full bg-gray-300 self-center mb-4" />

            <View className="flex-row items-center justify-between pb-3 border-b border-[#017374]/10">
              <View>
                <Text className="text-[10px] font-extrabold text-[#017374] uppercase tracking-widest">
                  DYNAMIC WORKOUT BUILDER
                </Text>
                <Text className="text-xl font-black text-[#014041]">
                  Add Exercise to Session
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowAddExerciseModal(false)}
                className="rounded-full bg-[#F0F9F6] p-2.5">
                <Ionicons name="close" size={20} color="#014041" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT BAR */}
            <View className="my-3 flex-row items-center rounded-2xl border border-[#017374]/20 bg-[#EBF7F4]/50 px-3.5 py-2.5">
              <Ionicons name="search" size={18} color="#017374" style={{ marginRight: 8 }} />
              <TextInput
                value={exerciseSearchQuery}
                onChangeText={setExerciseSearchQuery}
                placeholder="Search exercise (Bench Press, Squat...)"
                placeholderTextColor="#3A7574"
                className="flex-1 text-sm font-bold text-[#014041]"
              />
              {exerciseSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setExerciseSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#3A7574" />
                </TouchableOpacity>
              )}
            </View>

            {/* MUSCLE GROUP FILTER CHIPS */}
            <View className="mb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Calves', 'Abs', 'Cardio'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedMuscleFilter(cat)}
                    className={`mr-2 rounded-xl border px-3 py-1.5 ${
                      selectedMuscleFilter === cat
                        ? 'border-[#017374] bg-[#017374]'
                        : 'border-[#017374]/15 bg-[#EBF7F4]/60'
                    }`}>
                    <Text
                      className={`text-xs font-bold ${
                        selectedMuscleFilter === cat ? 'text-white' : 'text-[#025C5D]'
                      }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* EXERCISE LIST */}
            <ScrollView className="flex-1 my-1" showsVerticalScrollIndicator={false}>
              {DEFAULT_EXERCISE_LIBRARY.filter((ex) => {
                const matchesMuscle = selectedMuscleFilter === 'All' || ex.bodyPart.toLowerCase() === selectedMuscleFilter.toLowerCase();
                const matchesQuery = !exerciseSearchQuery || ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) || ex.bodyPart.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                return matchesMuscle && matchesQuery;
              }).map((ex, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleAddExerciseToSession(ex.name, ex.bodyPart)}
                  className="mb-2.5 flex-row items-center justify-between rounded-2xl border border-[#017374]/15 bg-[#EBF7F4]/40 p-3.5 active:bg-[#017374]/15">
                  <View className="flex-1 mr-2">
                    <Text className="text-sm font-bold text-[#014041]">{ex.name}</Text>
                    <Text className="text-xs text-[#017374] font-medium">{ex.bodyPart}</Text>
                  </View>
                  <View className="flex-row items-center rounded-xl bg-[#017374] px-3.5 py-2 shadow-xs">
                    <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 3 }} />
                    <Text className="text-xs font-extrabold text-white">Add</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* CUSTOM EXERCISE ENTRY BOX */}
              <View className="mt-4 p-4 rounded-2xl border border-dashed border-[#017374]/30 bg-white mb-6">
                <Text className="text-xs font-bold text-[#014041] mb-2">Can't find your exercise? Add custom:</Text>
                <View className="flex-row items-center space-x-2">
                  <TextInput
                    value={customExName}
                    onChangeText={setCustomExName}
                    placeholder="Custom exercise name"
                    placeholderTextColor="#3A7574"
                    className="flex-1 rounded-xl border border-[#017374]/20 bg-[#EBF7F4]/40 px-3 py-2.5 text-xs font-bold text-[#014041]"
                  />
                  <TouchableOpacity
                    onPress={() => handleAddExerciseToSession(customExName, customExBodyPart)}
                    disabled={!customExName.trim()}
                    className={`rounded-xl px-4 py-2.5 flex-row items-center ${
                      customExName.trim() ? 'bg-[#017374]' : 'bg-[#017374]/40'
                    }`}>
                    <Text className="text-xs font-bold text-white">+ Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAddExerciseModal(false)}
              className="mt-3 rounded-2xl border border-[#017374]/20 bg-[#EBF7F4] py-3 items-center">
              <Text className="text-xs font-bold text-[#014041]">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


