import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      }}
      resizeMode="cover"
      className="flex-1">
      {/* Overlay */}
      <View className="flex-1 justify-end bg-black/70 px-6 pb-16">
        <Text className="mb-2 text-lg font-semibold text-[#3efe18]">Welcome To</Text>

        <Text className="text-5xl font-bold leading-tight text-white">FitNova</Text>

        <Text className="mt-4 text-base leading-6 text-gray-300">
          Track workouts, build muscle, stay consistent, and transform your fitness journey.
        </Text>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mt-10 rounded-2xl bg-[#3efe18] py-4">
          <Text className="text-center text-lg font-bold text-black">Login</Text>
        </TouchableOpacity>

        {/* SIGNUP BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          className="mt-4 rounded-2xl border border-[#3efe18] py-4">
          <Text className="text-center text-lg font-bold text-[#3efe18]">Create Account</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
