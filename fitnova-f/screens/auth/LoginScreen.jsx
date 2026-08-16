import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import { validateEmail } from '../../utils/validation';

export default function LoginScreen({ navigation }) {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please fill all fields');
    }
    if (!validateEmail(email)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email');
    }
    if (password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters');
    }

    const res = await login(email, password);
    if (!res.success) {
      return Alert.alert('Login Failed', res.message || 'Something went wrong');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center bg-[#0B0E14] px-6">
        {/* Top Brand Logo Pill */}
        <View className="mb-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20">
            <Ionicons name="flash-outline" size={32} color="#10B981" />
          </View>
        </View>

        <Text className="text-3xl font-black text-white text-center">Welcome Back</Text>
        <Text className="mb-8 text-center text-sm font-medium text-slate-400">
          Log in to continue your fitness streak
        </Text>

        {/* Input Group */}
        <View className="space-y-4">
          {/* Email Input */}
          <View className="mb-4 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
            <Ionicons name="mail-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="w-full ml-3 text-md text-white"
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 0,
                marginBottom: 0,
                textAlignVertical: 'center',
              }}
            />
          </View>

          {/* Password Input */}
          <View className="mb-6 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="flex-1 ml-3 text-md text-white"
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                marginTop: 0,
                marginBottom: 0,
                textAlignVertical: 'center',
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={loading}
          className="items-center rounded-2xl bg-[#10B981] py-4 shadow-lg shadow-emerald-950/40">
          {loading ? (
            <ActivityIndicator color="#0B0E14" />
          ) : (
            <Text className="text-base font-bold text-[#0B0E14]">Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-8">
          <Text className="text-center text-sm font-medium text-slate-400">
            Don{"'"}t have an account? <Text className="font-bold text-[#10B981]">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
