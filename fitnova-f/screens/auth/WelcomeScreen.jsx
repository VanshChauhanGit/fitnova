import { View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
      }}
      resizeMode="cover"
      className="flex-1">
      {/* Light Overlay */}
      <View className="flex-1 justify-end bg-[#EBF7F4]/90 px-6 pb-16 pt-20">
        <View className="mb-5 h-20 w-20 overflow-hidden rounded-2xl border border-[#017374]/20 bg-white p-2 shadow-lg">
          <Image
            source={require('../../assets/logo-icon.png')}
            className="h-full w-full rounded-xl"
            resizeMode="contain"
          />
        </View>

        <View className="mb-4 inline-flex self-start rounded-full bg-[#017374]/15 px-4 py-1.5 border border-[#017374]/20">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#017374]">
            🔥 Empower Your Journey
          </Text>
        </View>

        <Text className="text-5xl font-black tracking-tight text-[#014041]">
          Fit<Text className="text-[#017374]">Nova</Text>
        </Text>

        <Text className="mt-3 text-base leading-relaxed text-[#025C5D]">
          Track workouts, build strength, stay consistent, and transform your fitness goals into real progress.
        </Text>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
          className="mt-10 rounded-2xl bg-[#017374] py-3.5 shadow-lg border border-[#017374]/20">
          <Text className="text-center text-lg font-bold tracking-wide text-white">
            Login
          </Text>
        </TouchableOpacity>

        {/* SIGNUP BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup')}
          className="mt-4 rounded-2xl border border-[#017374] bg-white py-3.5 shadow-sm">
          <Text className="text-center text-lg font-bold tracking-wide text-[#017374]">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
