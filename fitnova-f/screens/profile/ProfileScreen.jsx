import { View, Text, TouchableOpacity, Image } from 'react-native';

import useAuthStore from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  return (
    <View className="flex-1 bg-[#071e00] px-5 pt-16">
      {/* PROFILE */}
      <View className="items-center">
        <Image
          source={{
            uri:
              user.profileImage || user.gender === 'male'
                ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zml0bmVzcyUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
          }}
          className="h-32 w-32 rounded-full"
        />

        <Text className="mt-5 text-3xl font-bold text-white">{user.name}</Text>

        <Text className="mt-2 text-gray-400">@{user.username}</Text>
      </View>

      {/* STATS */}
      <View className="mt-10 flex-row justify-between">
        <View className="w-[30%] items-center rounded-2xl bg-[#112b0a] p-4">
          <Text className="text-2xl font-bold text-[#3efe18]">{user.age}</Text>

          <Text className="mt-1 text-gray-400">Age</Text>
        </View>

        <View className="w-[30%] items-center rounded-2xl bg-[#112b0a] p-4">
          <Text className="text-2xl font-bold text-[#3efe18]">{user.height} cm</Text>

          <Text className="mt-1 text-gray-400">Height</Text>
        </View>

        <View className="w-[30%] items-center rounded-2xl bg-[#112b0a] p-4">
          <Text className="text-2xl font-bold text-[#3efe18]">{user.weight} kg</Text>

          <Text className="mt-1 text-gray-400">Weight</Text>
        </View>
      </View>

      {/* BUTTONS */}
      <TouchableOpacity
        onPress={() => navigation.navigate('EditProfile')}
        className="mt-10 rounded-2xl bg-[#112b0a] p-5">
        <Text className="text-lg text-white">Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} className="mt-5 rounded-2xl bg-red-500 p-5">
        <Text className="text-center text-lg font-bold text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
