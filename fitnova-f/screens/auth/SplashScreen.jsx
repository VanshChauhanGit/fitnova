import { View, Text, ActivityIndicator, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#EBF7F4] px-6">
      {/* BRAND LOGO IMAGE */}
      <View className="h-32 w-32 items-center justify-center rounded-3xl border border-[#017374]/20 bg-white shadow-2xl overflow-hidden">
        <Image
          source={require('../../assets/logo-icon.png')}
          className="h-full w-full rounded-2xl"
          resizeMode="contain"
        />
      </View>

      {/* APP TITLE */}
      <Text className="mt-6 text-5xl font-black tracking-tight text-[#014041]">
        Fit<Text className="text-[#017374]">Nova</Text>
      </Text>

      {/* TAGLINE */}
      <View className="mt-3 rounded-full border border-[#017374]/20 bg-white px-4 py-1.5 shadow-sm">
        <Text className="text-xs font-bold uppercase tracking-widest text-[#017374]">
          Train Smarter • Live Better
        </Text>
      </View>

      {/* LOADING INDICATOR */}
      <ActivityIndicator size="large" color="#017374" className="mt-14" />
    </View>
  );
}
