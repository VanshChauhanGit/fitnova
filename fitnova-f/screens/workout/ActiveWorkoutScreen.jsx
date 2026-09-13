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
    <ScrollView className="flex-1 bg-[#EBF7F4] px-6 pt-16">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-[#017374]/20 bg-white p-3 shadow-sm">
          <Text className="text-sm font-bold text-[#017374]">← Back</Text>
        </TouchableOpacity>

        <View className="rounded-full bg-[#017374]/15 px-3 py-1 border border-[#017374]/25">
          <Text className="text-xs font-bold text-[#017374]">ACTIVE SESSION</Text>
        </View>
      </View>

      <Text className="mt-6 text-3xl font-black capitalize text-[#014041]">{exercise.name}</Text>
      <Text className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#3A7574]">
        {exercise.bodyPart} • {exercise.target}
      </Text>

      {/* TIMERS ROW */}
      <View className="mt-6 flex-row justify-between">
        {/* WORKOUT TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-sm">
          <Text className="text-xs font-semibold text-[#3A7574]">Workout Time</Text>
          <Text className="mt-2 text-3xl font-black text-[#017374]">{formatTime(seconds)}</Text>
        </View>

        {/* REST TIMER */}
        <View className="w-[48%] items-center rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-sm">
          <Text className="text-xs font-semibold text-[#3A7574]">Rest Timer</Text>
          <Text className="mt-2 text-3xl font-black text-[#017374]">{formatTime(restSeconds)}</Text>
        </View>
      </View>

      {/* INPUTS */}
      <View className="mt-8 rounded-3xl border border-[#017374]/15 bg-white p-6 space-y-4 shadow-sm">
        <Text className="text-sm font-bold text-[#014041]">Log New Set</Text>

        <View className="flex-row justify-between mt-3">
          <TextInput
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            placeholder="Reps (e.g. 10)"
            placeholderTextColor="#3A7574"
            className="w-[48%] rounded-2xl border border-[#017374]/20 bg-[#EBF7F4] p-4 text-[#014041] font-semibold"
          />

          <TextInput
            keyboardType="number-pad"
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight (kg)"
            placeholderTextColor="#3A7574"
            className="w-[48%] rounded-2xl border border-[#017374]/20 bg-[#EBF7F4] p-4 text-[#014041] font-semibold"
          />
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Set notes (optional)..."
          placeholderTextColor="#3A7574"
          multiline
          className="mt-3 h-20 rounded-2xl border border-[#017374]/20 bg-[#EBF7F4] p-4 text-[#014041] text-sm"
        />
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAddSet}
        className="mt-6 rounded-2xl bg-[#017374] py-4 shadow-md border border-[#017374]/20">
        <Text className="text-center text-base font-bold text-white">Add Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setRestPause(!restPause)}
        className={`mt-3 rounded-2xl border p-4 ${
          restPause
            ? 'border-[#017374] bg-[#017374]'
            : 'border-[#017374]/20 bg-white shadow-sm'
        }`}>
        <Text className={`text-center text-sm font-bold ${restPause ? 'text-white' : 'text-[#025C5D]'}`}>
          {restPause ? '✓ Rest Pause Enabled' : 'Enable Rest Pause Set'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleFinish}
        className="mb-20 mt-4 rounded-2xl border border-[#017374]/20 bg-[#D8F3EB] py-4 shadow-sm">
        <Text className="text-center text-base font-bold text-[#014041]">Finish Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
