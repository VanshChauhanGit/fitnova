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
    <ScrollView className="flex-1 bg-[#0B0E14] px-5 pt-16">
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
            className="h-28 w-28 rounded-full border-4 border-[#10B981]"
          />
          <View className="absolute bottom-1 right-1 rounded-full bg-[#10B981] p-1.5 border-2 border-[#0B0E14]">
            <Ionicons name="checkmark-sharp" size={14} color="#0B0E14" />
          </View>
        </View>

        <Text className="mt-4 text-2xl font-black text-white">{user?.name || 'Athlete'}</Text>
        <Text className="mt-1 text-sm font-semibold text-slate-400">@{user?.username || 'user'}</Text>

        {user?.activityLevel && (
          <View className="mt-3 rounded-full bg-[#10B981]/10 px-4 py-1 border border-[#10B981]/20">
            <Text className="text-xs font-bold uppercase text-[#10B981]">
              ⚡ {user.activityLevel} Athlete
            </Text>
          </View>
        )}
      </View>

      {/* STATS ROW */}
      <View className="mt-8 flex-row justify-between">
        <View className="w-[31%] items-center rounded-3xl border border-slate-800 bg-[#151B26] p-4">
          <Text className="text-2xl font-black text-[#10B981]">{user?.age || '--'}</Text>
          <Text className="mt-1 text-xs font-semibold text-slate-400">Age</Text>
        </View>

        <View className="w-[31%] items-center rounded-3xl border border-slate-800 bg-[#151B26] p-4">
          <Text className="text-2xl font-black text-cyan-400">
            {user?.height || '--'} <Text className="text-xs">cm</Text>
          </Text>
          <Text className="mt-1 text-xs font-semibold text-slate-400">Height</Text>
        </View>

        <View className="w-[31%] items-center rounded-3xl border border-slate-800 bg-[#151B26] p-4">
          <Text className="text-2xl font-black text-orange-400">
            {user?.weight || '--'} <Text className="text-xs">kg</Text>
          </Text>
          <Text className="mt-1 text-xs font-semibold text-slate-400">Weight</Text>
        </View>
      </View>

      {/* ACCOUNT & SETTINGS ACTIONS */}
      <View className="mt-8">
        <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Account Settings
        </Text>

        {/* Edit Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
          className="mb-3.5 flex-row items-center justify-between rounded-2xl border border-slate-800 bg-[#151B26] p-4 shadow-sm">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 mr-3.5">
              <Ionicons name="create-outline" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white">Edit Profile</Text>
              <Text className="text-xs font-medium text-slate-400 mt-0.5">
                Update stats, goals & photo
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="mb-3.5 flex-row items-center justify-between rounded-2xl border border-red-500/20 bg-[#151B26] p-4 shadow-sm">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 mr-3.5">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-red-400">Log Out</Text>
              <Text className="text-xs font-medium text-slate-500 mt-0.5">
                Sign out of your session
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}
