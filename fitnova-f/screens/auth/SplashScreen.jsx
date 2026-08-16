import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    if (navigation && navigation.replace) {
      const timer = setTimeout(() => {
        navigation.replace('Welcome');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-[#0B0E14] px-6">
      {/* GLOWING EMBLEM LOGO */}
      <View className="h-28 w-28 items-center justify-center rounded-3xl border border-[#10B981]/30 bg-[#10B981]/10 shadow-2xl shadow-emerald-950">
        <Ionicons name="flash-sharp" size={56} color="#10B981" />
      </View>

      {/* APP TITLE */}
      <Text className="mt-8 text-5xl font-black tracking-tight text-white">
        Fit<Text className="text-[#10B981]">Nova</Text>
      </Text>

      {/* TAGLINE */}
      <View className="mt-3 rounded-full border border-slate-800 bg-[#151B26] px-4 py-1.5">
        <Text className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Train Smarter • Live Better
        </Text>
      </View>

      {/* LOADING INDICATOR */}
      <ActivityIndicator size="large" color="#10B981" className="mt-14" />
    </View>
  );
}
