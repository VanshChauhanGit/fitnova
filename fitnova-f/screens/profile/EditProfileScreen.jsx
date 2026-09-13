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
    <ScrollView className="flex-1 bg-[#EBF7F4] px-6 pt-16">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-2xl border border-[#017374]/20 bg-white p-3 shadow-sm">
          <Ionicons name="arrow-back" size={20} color="#014041" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#014041]">Edit Profile</Text>
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
            className="h-28 w-28 rounded-full border-4 border-[#017374]"
          />
          <View className="absolute bottom-0 right-0 rounded-full bg-[#017374] p-2 border-2 border-[#EBF7F4]">
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </View>
        <Text className="mt-3 text-xs font-bold uppercase tracking-wider text-[#017374]">
          Change Photo
        </Text>
      </TouchableOpacity>

      {/* FORM INPUTS */}
      <View className="mt-8 space-y-4">
        <View className="mb-4">
          <Text className="mb-2 text-xs font-semibold text-[#3A7574]">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#3A7574"
            className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-[#014041] shadow-sm"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-xs font-semibold text-[#3A7574]">Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#3A7574"
            className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-[#014041] shadow-sm"
          />
        </View>

        <View className="mb-4 flex-row justify-between">
          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-[#3A7574]">Age</Text>
            <TextInput
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#3A7574"
              className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-[#014041] text-center shadow-sm"
            />
          </View>

          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-[#3A7574]">Height (cm)</Text>
            <TextInput
              keyboardType="number-pad"
              value={height}
              onChangeText={setHeight}
              placeholder="cm"
              placeholderTextColor="#3A7574"
              className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-[#014041] text-center shadow-sm"
            />
          </View>

          <View className="w-[31%]">
            <Text className="mb-2 text-xs font-semibold text-[#3A7574]">Weight (kg)</Text>
            <TextInput
              keyboardType="number-pad"
              value={weight}
              onChangeText={setWeight}
              placeholder="kg"
              placeholderTextColor="#3A7574"
              className="rounded-2xl border border-[#017374]/20 bg-white p-4 text-[#014041] text-center shadow-sm"
            />
          </View>
        </View>
      </View>

      {/* GOALS */}
      <View className="mt-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-[#014041]">Fitness Goals</Text>
          <Text className="text-xs font-bold text-[#017374]">{goals.length}/2 selected</Text>
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
                    ? 'border-[#017374] bg-[#017374]'
                    : 'border-[#017374]/20 bg-white shadow-sm'
                }`}>
                <Text
                  className={`text-center text-xs font-bold ${
                    selected ? 'text-white' : 'text-[#025C5D]'
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
        className="mb-24 mt-8 items-center rounded-2xl bg-[#017374] py-4 shadow-lg border border-[#017374]/20">
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-bold text-white">Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
