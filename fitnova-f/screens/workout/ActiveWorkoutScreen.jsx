import { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';

import useWorkoutStore from '../../store/workoutStore';

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { exercise } = route.params;

  const addSet = useWorkoutStore((state) => state.addSet);
  const saveWorkout = useWorkoutStore((state) => state.saveWorkout);
  const currentWorkout = useWorkoutStore((state) => state.currentWorkout);
  const clearActiveSession = useWorkoutStore((state) => state.clearActiveSession);

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
    const hasSets = currentWorkout && currentWorkout.some((ex) => (ex.sets || []).length > 0);
    if (!hasSets) {
      clearActiveSession?.();
      navigation.goBack();
      return;
    }

    const res = await saveWorkout(seconds);

    if (!res.success) {
      return Alert.alert('Error', res.message);
    }

    navigation.goBack();
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className="flex-1 bg-[#121417] px-6 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-[#2D333B] bg-[#1F2328] px-3.5 py-2.5 shadow-sm">
          <Text className="text-sm font-bold text-[#E8EAED]">← Back</Text>
        </TouchableOpacity>

        <View className="rounded-full bg-[#2D9CDB]/15 px-3 py-1 border border-[#2D9CDB]/25">
          <Text className="text-xs font-bold text-[#2D9CDB]">ACTIVE SESSION</Text>
        </View>
      </View>

      <Text className="mt-6 text-3xl font-black capitalize text-[#E8EAED]">{exercise.name}</Text>
      <Text className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#9AA0A6]">
        {exercise.bodyPart} • {exercise.target}
      </Text>

      {/* TIMERS ROW */}
      <View className="mt-6 flex-row justify-between">
        {/* WORKOUT TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-sm">
          <Text className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wider">Workout Time</Text>
          <Text className="mt-2 text-3xl font-black text-[#2D9CDB]">{formatTime(seconds)}</Text>
        </View>

        {/* REST TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-sm">
          <Text className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wider">Rest Timer</Text>
          <Text className="mt-2 text-3xl font-black text-[#F2C94C]">{formatTime(restSeconds)}</Text>
        </View>
      </View>

      {/* INPUTS */}
      <View className="mt-8 rounded-3xl border border-[#2D333B] bg-[#1F2328] p-6 space-y-4 shadow-sm">
        <Text className="text-sm font-black text-[#E8EAED]">Log New Set</Text>

        <View className="flex-row justify-between mt-3">
          <TextInput
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            placeholder="Reps (e.g. 10)"
            placeholderTextColor="#9AA0A6"
            className="w-[48%] rounded-2xl border border-[#2D333B] bg-[#16191E] p-4 text-[#E8EAED] font-bold"
          />

          <TextInput
            keyboardType="number-pad"
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight (kg)"
            placeholderTextColor="#9AA0A6"
            className="w-[48%] rounded-2xl border border-[#2D333B] bg-[#16191E] p-4 text-[#E8EAED] font-bold"
          />
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Set notes (optional)..."
          placeholderTextColor="#9AA0A6"
          multiline
          className="mt-3 h-20 rounded-2xl border border-[#2D333B] bg-[#16191E] p-4 text-[#E8EAED] text-sm"
        />
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAddSet}
        className="mt-6 rounded-2xl bg-[#2D9CDB] py-4 shadow-md border border-[#2D9CDB]">
        <Text className="text-center text-base font-black text-[#121417]">Add Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setRestPause(!restPause)}
        className={`mt-3 rounded-2xl border p-4 ${
          restPause
            ? 'border-[#F2C94C] bg-[#F2C94C]'
            : 'border-[#2D333B] bg-[#1F2328] shadow-sm'
        }`}>
        <Text className={`text-center text-sm font-bold ${restPause ? 'text-[#121417]' : 'text-[#9AA0A6]'}`}>
          {restPause ? '✓ Rest Pause Enabled' : 'Enable Rest Pause Set'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleFinish}
        className="mb-20 mt-4 rounded-2xl border border-[#2D333B] bg-[#16191E] py-4 shadow-sm">
        <Text className="text-center text-base font-black text-[#2D9CDB]">Finish Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
