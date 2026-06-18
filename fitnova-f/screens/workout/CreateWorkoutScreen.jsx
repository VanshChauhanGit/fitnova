import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useState } from 'react';

export default function CreateWorkoutScreen() {
  const [name, setName] = useState('');

  return (
    <View className="flex-1 bg-[#071e00] px-6 pt-16">
      <Text className="text-4xl font-bold text-white">Create Workout</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Workout name"
        placeholderTextColor="#888"
        className="mt-8 rounded-2xl bg-[#112b0a] p-5 text-white"
      />

      <TouchableOpacity className="mt-8 rounded-2xl bg-[#3efe18] py-5">
        <Text className="text-center font-bold text-black">Create</Text>
      </TouchableOpacity>
    </View>
  );
}
