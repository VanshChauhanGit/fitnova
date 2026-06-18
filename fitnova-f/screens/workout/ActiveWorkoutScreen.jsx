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

  return (
    <ScrollView className="flex-1 bg-[#071e00] px-6 pt-16">
      <Text className="text-4xl font-bold capitalize text-white">{exercise.name}</Text>

      {/* TIMER */}
      <View className="mt-8 items-center rounded-3xl bg-[#112b0a] p-6">
        <Text className="text-gray-400">Workout Timer</Text>

        <Text className="mt-3 text-5xl font-bold text-[#3efe18]">{seconds}s</Text>
      </View>

      {/* REST */}
      <View className="mt-5 items-center rounded-3xl bg-[#112b0a] p-6">
        <Text className="text-gray-400">Rest Timer</Text>

        <Text className="mt-3 text-5xl font-bold text-white">{restSeconds}s</Text>
      </View>

      {/* INPUTS */}
      <View className="mt-8">
        <TextInput
          keyboardType="number-pad"
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          keyboardType="number-pad"
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight (kg)"
          placeholderTextColor="#888"
          className="rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Workout notes..."
          placeholderTextColor="#888"
          multiline
          className="mt-5 h-28 rounded-2xl bg-[#112b0a] p-5 text-white"
        />
      </View>

      {/* BUTTONS */}
      <TouchableOpacity onPress={handleAddSet} className="mt-8 rounded-2xl bg-[#3efe18] py-5">
        <Text className="text-center text-lg font-bold text-black">Add Set</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setRestPause(!restPause)}
        className={`mt-5 rounded-2xl p-5 ${restPause ? 'bg-[#3efe18]' : 'bg-[#112b0a]'}`}>
        <Text className={`text-center font-bold ${restPause ? 'text-black' : 'text-white'}`}>
          Rest Pause Set
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFinish} className="mb-20 mt-4 rounded-2xl bg-[#112b0a] py-5">
        <Text className="text-center text-lg font-bold text-white">Finish Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
