import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
      }}
      resizeMode="cover"
      className="flex-1">
      {/* Dark Overlay with subtle gradient */}
      <View className="flex-1 justify-end bg-slate-950/80 px-6 pb-16 pt-20">
        <View className="mb-4 inline-flex self-start rounded-full bg-emerald-500/10 px-4 py-1.5 border border-emerald-500/20">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
            🔥 Empower Your Journey
          </Text>
        </View>

        <Text className="text-5xl font-black tracking-tight text-white">
          Fit<Text className="text-[#10B981]">Nova</Text>
        </Text>

        <Text className="mt-3 text-base leading-relaxed text-slate-300">
          Track workouts, build strength, stay consistent, and transform your fitness goals into real progress.
        </Text>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
          className="mt-10 rounded-2xl bg-[#10B981] py-3 shadow-lg shadow-emerald-950/50">
          <Text className="text-center text-lg font-bold tracking-wide text-slate-950">
            Login
          </Text>
        </TouchableOpacity>

        {/* SIGNUP BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup')}
          className="mt-4 rounded-2xl border border-emerald-500/40 bg-slate-900/60 py-3 backdrop-blur-md">
          <Text className="text-center text-lg font-bold tracking-wide text-[#10B981]">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
