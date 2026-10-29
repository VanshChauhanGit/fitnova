import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
      }}
      resizeMode="cover"
      className="flex-1">
      {/* Dark Luxury Overlay */}
      <View className="flex-1 justify-end bg-[#121417]/90 px-6 pb-16 pt-20">
        {/* <View className="mb-5 h-20 w-20 overflow-hidden rounded-2xl border border-[#2D333B] bg-[#1F2328] p-2.5 shadow-2xl">
          <Image
            source={require('../../assets/logo-icon.png')}
            className="h-full w-full rounded-xl"
            resizeMode="contain"
          />
        </View> */}

        

        <Text className="text-5xl font-black tracking-tight text-[#E8EAED]">
          Fit<Text className="text-[#2D9CDB]">Nova</Text>
        </Text>

        <View className="my-2 inline-flex self-start rounded-full bg-[#F2C94C]/15 px-4 py-1.5 border border-[#F2C94C]/30">
          <Text className="text-xs font-bold uppercase tracking-wider text-[#F2C94C]">
            ⚡ Elevate Your Performance
          </Text>
        </View>

        <Text className="mt-3 text-base leading-relaxed text-[#9AA0A6]">
          Track workouts, build strength, stay consistent, and transform your fitness goals into real progress.
        </Text>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
          className="mt-10 rounded-2xl bg-[#2D9CDB] py-4 shadow-lg shadow-[#2D9CDB]/30 border border-[#2D9CDB]/40">
          <Text className="text-center text-lg font-black tracking-wide text-[#121417]">
            Login
          </Text>
        </TouchableOpacity>

        {/* SIGNUP BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup')}
          className="mt-4 rounded-2xl border border-[#2D333B] bg-[#1F2328] py-4 shadow-sm">
          <Text className="text-center text-lg font-bold tracking-wide text-[#E8EAED]">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
