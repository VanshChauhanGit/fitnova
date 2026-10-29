import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { useState } from 'react';

export default function CreateWorkoutScreen() {
  const [name, setName] = useState('');

  return (
    <View className="flex-1 bg-[#121417] px-6 pt-16">
      <Text className="text-3xl font-black text-[#E8EAED]">Create Workout</Text>
      <Text className="text-xs text-[#9AA0A6] mt-1 mb-6">Create a custom routine template</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Workout routine name"
        placeholderTextColor="#9AA0A6"
        className="rounded-2xl bg-[#1F2328] border border-[#2D333B] p-5 text-[#E8EAED] font-bold"
      />

      <TouchableOpacity className="mt-6 rounded-2xl bg-[#2D9CDB] py-4 shadow-md">
        <Text className="text-center font-black text-[#121417]">Create Routine</Text>
      </TouchableOpacity>
    </View>
  );
}
