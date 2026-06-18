import { View, Text, ActivityIndicator } from 'react-native';

import { useEffect } from 'react';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-[#071e00]">
      {/* LOGO */}
      <View className="h-28 w-28 items-center justify-center rounded-full bg-[#3efe18] shadow-lg">
        <Text className="text-4xl font-bold text-black">F</Text>
      </View>

      {/* APP NAME */}
      <Text className="mt-6 text-5xl font-bold text-white">FitNova</Text>

      <Text className="mt-2 text-lg text-gray-400">Train Smarter. Live Better.</Text>

      <ActivityIndicator size="large" color="#3efe18" className="mt-12" />
    </View>
  );
}
