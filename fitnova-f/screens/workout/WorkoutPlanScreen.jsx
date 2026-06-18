import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const plans = ['Push Pull Legs', 'Upper Lower', 'Arnold Split', 'Bro Split'];

export default function WorkoutPlansScreen() {
  return (
    <ScrollView className="flex-1 bg-[#071e00] px-5 pt-16">
      <Text className="text-4xl font-bold text-white">Workout Plans</Text>

      {plans.map((plan) => (
        <TouchableOpacity key={plan} className="mt-5 rounded-3xl bg-[#112b0a] p-6">
          <Text className="text-2xl font-bold text-white">{plan}</Text>

          <Text className="mt-2 text-gray-400">6 day program</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
