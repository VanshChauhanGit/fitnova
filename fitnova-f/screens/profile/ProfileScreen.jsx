import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of FitNova?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-[#EBF7F4] px-5 pt-16">
      {/* PROFILE HEADER */}
      <View className="items-center">
        <View className="relative">
          <Image
            source={{
              uri:
                user?.profileImage ||
                (user?.gender === 'male'
                  ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop'
                  : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop'),
            }}
            className="h-28 w-28 rounded-full border-4 border-[#017374]"
          />
          <View className="absolute bottom-1 right-1 rounded-full bg-[#017374] p-1.5 border-2 border-[#EBF7F4]">
            <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
          </View>
        </View>

        <Text className="mt-4 text-2xl font-black text-[#014041]">{user?.name || 'Athlete'}</Text>
        <Text className="mt-1 text-sm font-semibold text-[#025C5D]">@{user?.username || 'user'}</Text>

        {user?.activityLevel && (
          <View className="mt-3 rounded-full bg-[#017374]/15 px-4 py-1 border border-[#017374]/25">
            <Text className="text-xs font-bold uppercase text-[#017374]">
              ⚡ {user.activityLevel} Athlete
            </Text>
          </View>
        )}
      </View>

      {/* STATS ROW */}
      <View className="mt-8 flex-row justify-between">
        <View className="w-[31%] items-center rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
          <Text className="text-2xl font-black text-[#017374]">{user?.age || '--'}</Text>
          <Text className="mt-1 text-xs font-semibold text-[#3A7574]">Age</Text>
        </View>

        <View className="w-[31%] items-center rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
          <Text className="text-2xl font-black text-[#017374]">
            {user?.height || '--'} <Text className="text-xs">cm</Text>
          </Text>
          <Text className="mt-1 text-xs font-semibold text-[#3A7574]">Height</Text>
        </View>

        <View className="w-[31%] items-center rounded-3xl border border-[#017374]/15 bg-white p-4 shadow-sm">
          <Text className="text-2xl font-black text-orange-500">
            {user?.weight || '--'} <Text className="text-xs">kg</Text>
          </Text>
          <Text className="mt-1 text-xs font-semibold text-[#3A7574]">Weight</Text>
        </View>
      </View>

      {/* ACCOUNT & SETTINGS ACTIONS */}
      <View className="mt-8">
        <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-[#3A7574]">
          Account Settings
        </Text>

        {/* Edit Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
          className="mb-3.5 flex-row items-center justify-between rounded-2xl border border-[#017374]/15 bg-white p-4 shadow-sm">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#017374]/15 border border-[#017374]/25 mr-3.5">
              <Ionicons name="create-outline" size={20} color="#017374" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#014041]">Edit Profile</Text>
              <Text className="text-xs font-medium text-[#025C5D] mt-0.5">
                Update stats, goals & photo
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#3A7574" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="mb-3.5 flex-row items-center justify-between rounded-2xl border border-red-500/20 bg-white p-4 shadow-sm">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 mr-3.5">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-red-500">Log Out</Text>
              <Text className="text-xs font-medium text-[#3A7574] mt-0.5">
                Sign out of your session
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* BRAND FOOTER */}
      <View className="items-center justify-center my-6 flex-row space-x-2">
        <Image source={require('../../assets/logo-icon.png')} className="h-6 w-6 rounded-md" resizeMode="contain" />
        <Text className="text-xs font-semibold text-[#3A7574]">FitNova v1.0.0 • Train Smarter</Text>
      </View>

      <View className="h-24" />
    </ScrollView>
  );
}
