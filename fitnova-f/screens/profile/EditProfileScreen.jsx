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
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';

const goalsData = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Gain Strength'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function EditProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState(user?.name);
  const [username, setUsername] = useState(user?.username);
  const [age, setAge] = useState(String(user?.age || ''));
  const [gender, setGender] = useState(user?.gender || 'male');
  const [height, setHeight] = useState(String(user?.height || ''));
  const [weight, setWeight] = useState(String(user?.weight || ''));
  const [goals, setGoals] = useState(user?.goals || []);
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'Intermediate');
  const [profileImage, setProfileImage] = useState(user?.profileImage);

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

    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-[#0B0E14] px-6 pt-16">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-slate-800 bg-[#151B26] p-3">
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Edit Profile</Text>
        <View className="w-10" />
      </View>

      {/* PROFILE IMAGE PICKER */}
      <TouchableOpacity activeOpacity={0.8} onPress={pickImage} className="mt-8 items-center">
        <View className="relative">
          <Image
            source={{
              uri:
                profileImage ||
                (gender === 'male'
                  ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop'
                  : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop'),
            }}
            className="h-28 w-28 rounded-full border-4 border-[#10B981]"
          />
          <View className="absolute bottom-0 right-0 rounded-full bg-[#10B981] p-2 border-2 border-[#0B0E14]">
            <Ionicons name="camera" size={16} color="#0B0E14" />
          </View>
        </View>
        <Text className="mt-3 text-xs font-bold uppercase tracking-wider text-[#10B981]">
          Change Photo
        </Text>
      </TouchableOpacity>

      {/* FORM INPUTS */}
      <View className="mt-8 space-y-4">
        <View className="mb-4">
          <Text className="mb-2 text-xs font-semibold text-slate-400">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#64748B"
            className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-white"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-xs font-semibold text-slate-400">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#64748B"
            className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-white"
          />
        </View>

        <View className="mb-4 flex-row justify-between">
          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-slate-400">Age</Text>
            <TextInput
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#64748B"
              className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-white text-center"
            />
          </View>

          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-slate-400">Height (cm)</Text>
            <TextInput
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
              placeholder="cm"
              placeholderTextColor="#64748B"
              className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-white text-center"
            />
          </View>

          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-slate-400">Weight (kg)</Text>
            <TextInput
              keyboardType="number-pad"
              value={weight}
              onChangeText={setWeight}
              placeholder="kg"
              placeholderTextColor="#64748B"
              className="rounded-2xl border border-slate-800 bg-[#151B26] p-4 text-white text-center"
            />
          </View>
        </View>
      </View>

      {/* GOALS */}
      <View className="mt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-white">Fitness Goals</Text>
          <Text className="text-xs font-bold text-[#10B981]">{goals.length}/2 selected</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {goalsData.map((goal) => {
            const selected = goals.includes(goal);
            return (
              <TouchableOpacity
                key={goal}
                activeOpacity={0.8}
                onPress={() => toggleGoal(goal)}
                className={`mb-3 w-[48%] rounded-2xl border p-4 ${
                  selected
                    ? 'border-[#10B981] bg-[#10B981]'
                    : 'border-slate-800 bg-[#151B26]'
                }`}>
                <Text
                  className={`text-center text-xs font-bold ${
                    selected ? 'text-[#0B0E14]' : 'text-slate-300'
                  }`}>
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={loading}
        onPress={handleUpdate}
        className="mb-24 mt-8 items-center rounded-2xl bg-[#10B981] py-4 shadow-lg shadow-emerald-950/40">
        {loading ? (
          <ActivityIndicator color="#0B0E14" />
        ) : (
          <Text className="text-base font-bold text-[#0B0E14]">Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
