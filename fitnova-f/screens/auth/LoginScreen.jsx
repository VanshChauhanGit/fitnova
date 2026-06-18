import { useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import useAuthStore from '../../store/authStore';

import { validateEmail } from '../../utils/validation';

export default function LoginScreen({ navigation }) {
  const login = useAuthStore((state) => state.login);

  const loading = useAuthStore((state) => state.loading);

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Empty validation
    if (!email || !password) {
      return Alert.alert('Missing Fields', 'Please fill all fields');
    }

    // Email validation
    if (!validateEmail(email)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email');
    }

    // Password validation
    if (password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters');
    }

    const res = await login(email, password);

    if (!res.success) {
      return Alert.alert('Login Failed', res.message || 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#071e00] px-6">
      <Text className="mb-2 text-4xl font-bold text-white">Welcome Back</Text>

      <Text className="mb-10 text-gray-400">Login to continue</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        className="mb-4 rounded-2xl bg-[#112b0a] p-4 text-white"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="mb-6 rounded-2xl bg-[#112b0a] p-4 text-white"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="items-center rounded-2xl bg-[#3efe18] p-4">
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text className="text-lg font-bold text-black">Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-6">
        <Text className="text-center text-gray-400">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
