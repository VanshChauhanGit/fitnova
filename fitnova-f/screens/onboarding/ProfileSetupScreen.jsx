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
    <ScrollView className="flex-1 bg-[#071e00] px-6 pt-16">
      <Text className="text-lg text-[#3efe18]">Setup Profile</Text>

      <Text className="mt-2 text-4xl font-bold text-white">Tell us about yourself</Text>

      {/* AGE */}
      <View className="mt-10">
        <Text className="mb-3 text-lg text-white">Age</Text>

        <TextInput
          keyboardType="numeric"
          value={age}
          maxLength={3}
          onChangeText={setAge}
          placeholder="Enter your age"
          placeholderTextColor="#888"
          className="rounded-2xl bg-[#112b0a] p-5 text-white"
        />
      </View>

      {/* GENDER */}
      <View className="mt-8">
        <Text className="mb-3 text-lg text-white">Gender</Text>

        <View className="flex-row justify-between">
          {['Male', 'Female'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setGender(item)}
              className={`w-[48%] rounded-2xl p-5 ${
                gender === item ? 'bg-[#3efe18]' : 'bg-[#112b0a]'
              }`}>
              <Text
                className={`text-center font-bold ${
                  gender === item ? 'text-black' : 'text-white'
                }`}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* HEIGHT */}
      <View className="mt-8">
        <Text className="mb-3 text-lg text-white">Height (cm)</Text>

        <TextInput
          keyboardType="numeric"
          value={height}
          maxLength={3}
          onChangeText={setHeight}
          placeholder="Enter your height"
          placeholderTextColor="#888"
          className="rounded-2xl bg-[#112b0a] p-5 text-white"
        />
      </View>

      {/* WEIGHT */}
      <View className="mt-8">
        <Text className="mb-3 text-lg text-white">Weight (kg)</Text>

        <TextInput
          keyboardType="numeric"
          maxLength={3}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter your weight"
          placeholderTextColor="#888"
          className="rounded-2xl bg-[#112b0a] p-5 text-white"
        />
      </View>

      {/* GOALS */}
      <View className="mt-8">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg text-white">Fitness Goals</Text>

          <Text className="text-[#3efe18]">{goals.length}/2</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {goalsData.map((item) => {
            const selected = goals.includes(item);

            return (
              <TouchableOpacity
                key={item}
                onPress={() => toggleGoal(item)}
                className={`mb-4 w-[48%] rounded-2xl border p-5 ${
                  selected ? 'border-[#3efe18] bg-[#3efe18]' : 'border-[#1f3b16] bg-[#112b0a]'
                }`}>
                <Text className={`text-center font-bold ${selected ? 'text-black' : 'text-white'}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* LEVEL */}
      <View className="mt-4">
        <Text className="mb-4 text-lg text-white">Activity Level</Text>

        <View className="flex-row justify-between">
          {activityLevels.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setActivityLevel(item)}
              className={`w-[31.5%] rounded-2xl px-2 py-5 ${
                activityLevel === item ? 'bg-[#3efe18]' : 'bg-[#112b0a]'
              }`}>
              <Text
                className={`text-center font-bold ${
                  activityLevel === item ? 'text-black' : 'text-white'
                }`}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleContinue}
        className="mb-20 mt-10 items-center rounded-2xl bg-[#3efe18] py-5">
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text className="text-center text-lg font-bold text-black">Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
