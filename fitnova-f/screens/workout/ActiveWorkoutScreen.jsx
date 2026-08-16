import { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';

import useWorkoutStore from '../../store/workoutStore';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { exercise } = route.params;

  const addSet = useWorkoutStore((state) => state.addSet);

  const saveWorkout = useWorkoutStore((state) => state.saveWorkout);

  const [reps, setReps] = useState('');

  const [weight, setWeight] = useState('');

  const [seconds, setSeconds] = useState(0);

  const [restSeconds, setRestSeconds] = useState(60);

  const [notes, setNotes] = useState('');

  const [restPause, setRestPause] = useState(false);

  // WORKOUT TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // REST TIMER
  useEffect(() => {
    if (restSeconds <= 0) return;

    const timer = setInterval(() => {
      setRestSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [restSeconds]);

  const handleAddSet = () => {
    if (!reps || !weight) {
      return Alert.alert('Missing Fields', 'Enter reps and weight');
    }

    addSet(exercise, {
      reps: Number(reps),

      weight: Number(weight),

      restPause,
    });

    setRestSeconds(90);

    setReps('');
    setWeight('');

    // Alert.alert('Set Added', 'Rest timer started');
  };

  const handleFinish = async () => {
    const res = await saveWorkout(seconds);

    if (!res.success) {
      return Alert.alert('Error', res.message);
    }

    // Alert.alert('Workout Saved', 'Great job 💪');

    navigation.goBack();
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-6 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-3">
          <Text className="text-sm font-bold text-slate-300">← Back</Text>
        </TouchableOpacity>

        <View className="rounded-full bg-[#10B981]/10 px-3 py-1 border border-[#10B981]/20">
          <Text className="text-xs font-bold text-[#10B981]">ACTIVE SESSION</Text>
        </View>
      </View>

      <Text className="mt-6 text-3xl font-black capitalize text-white">{exercise.name}</Text>
      <Text className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {exercise.bodyPart} • {exercise.target}
      </Text>

      {/* TIMERS ROW */}
      <View className="mt-6 flex-row justify-between">
        {/* WORKOUT TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <Text className="text-xs font-semibold text-slate-400">Workout Time</Text>
          <Text className="mt-2 text-3xl font-black text-[#10B981]">{formatTime(seconds)}</Text>
        </View>

        {/* REST TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-slate-800 bg-[#151B26] p-5">
          <Text className="text-xs font-semibold text-slate-400">Rest Timer</Text>
          <Text className="mt-2 text-3xl font-black text-cyan-400">{formatTime(restSeconds)}</Text>
        </View>
      </View>

      {/* INPUTS */}
      <View className="mt-8 rounded-3xl border border-slate-800 bg-[#151B26] p-6 space-y-4">
        <Text className="text-sm font-bold text-slate-300">Log New Set</Text>

        <View className="flex-row justify-between mt-3">
          <TextInput
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            placeholder="Reps (e.g. 10)"
            placeholderTextColor="#64748B"
            className="w-[48%] rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white font-semibold"
          />

          <TextInput
            keyboardType="number-pad"
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight (kg)"
            placeholderTextColor="#64748B"
            className="w-[48%] rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white font-semibold"
          />
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Set notes (optional)..."
          placeholderTextColor="#64748B"
          multiline
          className="mt-3 h-20 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white text-sm"
        />
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAddSet}
        className="mt-6 rounded-2xl bg-[#10B981] py-4 shadow-lg shadow-emerald-950/40">
        <Text className="text-center text-base font-bold text-[#0B0E14]">Add Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setRestPause(!restPause)}
        className={`mt-3 rounded-2xl border p-4 ${
          restPause
            ? 'border-cyan-400 bg-cyan-500/20'
            : 'border-slate-800 bg-[#151B26]'
        }`}>
        <Text className={`text-center text-sm font-bold ${restPause ? 'text-cyan-400' : 'text-slate-300'}`}>
          {restPause ? '✓ Rest Pause Enabled' : 'Enable Rest Pause Set'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleFinish}
        className="mb-20 mt-4 rounded-2xl border border-slate-800 bg-slate-900 py-4">
        <Text className="text-center text-base font-bold text-slate-300">Finish Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
