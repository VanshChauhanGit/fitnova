import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { validateAge, validateHeight, validateWeight } from '../../utils/validation';

import useAuthStore from '../../store/authStore';

const goalsData = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Gain Strength'];

const activityLevels = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfileSetupScreen() {
  const user = useAuthStore((state) => state.user);

  const completeProfile = useAuthStore((state) => state.completeProfile);

  const loading = useAuthStore((state) => state.loading);

  const navigation = useNavigation();

  const [age, setAge] = useState('');

  const [gender, setGender] = useState('Male');

  const [height, setHeight] = useState('');

  const [weight, setWeight] = useState('');

  const [goals, setGoals] = useState([]);

  const [activityLevel, setActivityLevel] = useState('');

  const handleContinue = async () => {
    if (!age || !height || !weight || goals.length === 0 || !activityLevel) {
      return Alert.alert('Missing Fields', 'Please complete your profile');
    }

    // Age validation
    if (!validateAge(age)) {
      return Alert.alert('Invalid Age', 'Age must be between 13 and 100');
    }

    // Height validation
    if (!validateHeight(height)) {
      return Alert.alert('Invalid Height', 'Height must be between 100cm and 250cm');
    }

    // Weight validation
    if (!validateWeight(weight)) {
      return Alert.alert('Invalid Weight', 'Weight must be between 30kg and 250kg');
    }

    // Goals validation
    if (goals.length > 2) {
      return Alert.alert('Too Many Goals', 'You can select up to 2 goals only');
    }

    const profileData = {
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      goals,
      activityLevel,
    };

    if (user?.name) profileData.name = user.name;
    if (user?.username) profileData.username = user.username;

    const res = await completeProfile(profileData);

    if (!res.success) {
      return Alert.alert('Error', res.message || 'Something went wrong');
    }

    Alert.alert('Success', 'Profile completed');
  };

  const toggleGoal = (selectedGoal) => {
    if (goals.includes(selectedGoal)) {
      setGoals(goals.filter((goal) => goal !== selectedGoal));

      return;
    }

    // Max 2 goals
    if (goals.length >= 2) {
      return Alert.alert('Limit Reached', 'You can select up to 2 goals only');
    }

    setGoals([...goals, selectedGoal]);
  };

  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-6 pt-16">
      <View className="mb-2 inline-flex self-start rounded-full bg-[#10B981]/10 px-4 py-1.5 border border-[#10B981]/20">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
          Step 1 of 1 • Setup Profile
        </Text>
      </View>

      <Text className="mt-2 text-3xl font-black text-white">Tell us about yourself</Text>
      <Text className="mt-1 text-sm font-medium text-slate-400">
        Help us personalize your workouts and targets
      </Text>

      {/* AGE */}
      <View className="mt-8">
        <Text className="mb-2 text-sm font-semibold text-slate-300">Age</Text>
        <TextInput
          keyboardType="numeric"
          value={age}
          maxLength={3}
          onChangeText={setAge}
          placeholder="Enter your age (e.g. 24)"
          placeholderTextColor="#64748B"
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-base text-white"
        />
      </View>

      {/* GENDER */}
      <View className="mt-6">
        <Text className="mb-2 text-sm font-semibold text-slate-300">Gender</Text>
        <View className="flex-row justify-between">
          {['Male', 'Female'].map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setGender(item)}
              className={`w-[48%] rounded-2xl border p-4.5 ${
                gender === item
                  ? 'border-[#10B981] bg-[#10B981]'
                  : 'border-slate-800 bg-[#151B26]'
              }`}>
              <Text
                className={`text-center font-bold ${
                  gender === item ? 'text-[#0B0E14]' : 'text-white'
                }`}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* HEIGHT */}
      <View className="mt-6">
        <Text className="mb-2 text-sm font-semibold text-slate-300">Height (cm)</Text>
        <TextInput
          keyboardType="numeric"
          value={height}
          maxLength={3}
          onChangeText={setHeight}
          placeholder="Enter height in cm (e.g. 175)"
          placeholderTextColor="#64748B"
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-base text-white"
        />
      </View>

      {/* WEIGHT */}
      <View className="mt-6">
        <Text className="mb-2 text-sm font-semibold text-slate-300">Weight (kg)</Text>
        <TextInput
          keyboardType="numeric"
          maxLength={3}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight in kg (e.g. 70)"
          placeholderTextColor="#64748B"
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-base text-white"
        />
      </View>

      {/* GOALS */}
      <View className="mt-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-300">Fitness Goals</Text>
          <Text className="text-xs font-bold text-[#10B981]">{goals.length}/2 selected</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {goalsData.map((item) => {
            const selected = goals.includes(item);

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => toggleGoal(item)}
                className={`mb-3.5 w-[48%] rounded-2xl border p-4.5 ${
                  selected
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-800 bg-[#151B26]'
                }`}>
                <Text
                  className={`text-center font-bold ${
                    selected ? 'text-[#0B0E14]' : 'text-white'
                  }`}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* LEVEL */}
      <View className="mt-4">
        <Text className="mb-3 text-sm font-semibold text-slate-300">Activity Level</Text>

        <View className="flex-row justify-between">
          {activityLevels.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setActivityLevel(item)}
              className={`w-[31%] rounded-2xl border px-2 py-4 ${
                activityLevel === item
                  ? 'border-[#10B981] bg-[#10B981]'
                  : 'border-slate-800 bg-[#151B26]'
              }`}>
              <Text
                className={`text-center text-xs font-bold ${
                  activityLevel === item ? 'text-[#0B0E14]' : 'text-white'
                }`}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={loading}
        onPress={handleContinue}
        className="mb-20 mt-10 items-center rounded-2xl bg-[#10B981] py-4.5 shadow-lg shadow-emerald-950/40">
        {loading ? (
          <ActivityIndicator color="#0B0E14" />
        ) : (
          <Text className="text-center text-base font-bold text-[#0B0E14]">Complete Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
