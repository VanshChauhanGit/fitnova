import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import useAuthStore from '../../store/authStore';

const goalsData = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Gain Strength'];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function EditProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);

  const updateProfile = useAuthStore((state) => state.updateProfile);

  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState(user?.name);

  const [username, setUsername] = useState(user?.username);

  const [age, setAge] = useState(String(user?.age));

  const [gender, setGender] = useState(user?.gender);

  const [height, setHeight] = useState(String(user?.height));

  const [weight, setWeight] = useState(String(user?.weight));

  const [goals, setGoals] = useState(user?.goals || []);

  const [activityLevel, setActivityLevel] = useState(user?.activityLevel);

  const [profileImage, setProfileImage] = useState(user?.profileImage);

  // PICK IMAGE
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      quality: 1,

      allowsEditing: true,

      aspect: [1, 1],
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // TOGGLE GOALS
  const toggleGoal = (goal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));

      return;
    }

    if (goals.length >= 2) {
      return Alert.alert('Limit Reached', 'Maximum 2 goals allowed');
    }

    setGoals([...goals, goal]);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!name || !username || !age || !height || !weight) {
      return Alert.alert('Missing Fields', 'Please fill all fields');
    }

    const res = await updateProfile({
      name,
      username,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      goals,
      activityLevel,
      profileImage,
    });

    if (!res.success) {
      return Alert.alert('Update Failed', res.message);
    }

    // Alert.alert('Success', 'Profile Updated');

    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-[#071e00] px-6 pt-16">
      {/* HEADER */}
      <Text className="text-4xl font-bold text-white">Edit Profile</Text>

      {/* PROFILE IMAGE */}
      <TouchableOpacity onPress={pickImage} className="mt-8 items-center">
        <Image
          source={{
            uri:
              profileImage || gender === 'male'
                ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zml0bmVzcyUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
          }}
          className="h-32 w-32 rounded-full"
        />

        <Text className="mt-4 font-semibold text-[#3efe18]">Change Photo</Text>
      </TouchableOpacity>

      {/* INPUTS */}
      <View className="mt-10">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
          placeholder="Age"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          keyboardType="number-pad"
          value={height}
          onChangeText={setHeight}
          placeholder="Height"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />

        <TextInput
          keyboardType="number-pad"
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight"
          placeholderTextColor="#888"
          className="mb-4 rounded-2xl bg-[#112b0a] p-5 text-white"
        />
      </View>

      {/* GOALS */}
      <Text className="mb-4 mt-8 text-xl font-bold text-white">Goals ({goals.length}/2)</Text>

      <View className="flex-row flex-wrap justify-between">
        {goalsData.map((goal) => {
          const selected = goals.includes(goal);

          return (
            <TouchableOpacity
              key={goal}
              onPress={() => toggleGoal(goal)}
              className={`mb-4 w-[48%] rounded-2xl p-5 ${
                selected ? 'bg-[#3efe18]' : 'bg-[#112b0a]'
              }`}>
              <Text className={`text-center font-bold ${selected ? 'text-black' : 'text-white'}`}>
                {goal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleUpdate}
        className="mb-20 mt-10 items-center rounded-2xl bg-[#3efe18] py-5">
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text className="text-lg font-bold text-black">Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
