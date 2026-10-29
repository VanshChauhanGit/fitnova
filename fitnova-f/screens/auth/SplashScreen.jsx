import { View, Text, ActivityIndicator, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#121417] px-6">
      {/* BRAND LOGO IMAGE */}
      <View className="h-36 w-36 items-center justify-center rounded-2xl border border-[#2D333B] shadow-2xl overflow-hidden">
        <Image
          source={require('../../assets/logo-icon.png')}
          className="h-full w-full rounded-2xl"
          resizeMode="contain"
        />
      </View>

      {/* APP TITLE */}
      <Text className="mt-6 text-5xl font-black tracking-tight text-[#E8EAED]">
        Fit<Text className="text-[#2D9CDB]">Nova</Text>
      </Text>

      {/* TAGLINE */}
      <View className="mt-3 rounded-full border border-[#F2C94C]/30 bg-[#1F2328] px-4 py-1.5 shadow-sm">
        <Text className="text-xs font-bold uppercase tracking-widest text-[#F2C94C]">
          Train Smarter • Live Better
        </Text>
      </View>

      {/* LOADING INDICATOR */}
      <ActivityIndicator size="large" color="#2D9CDB" className="mt-14" />
    </View>
  );
}
