import { useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import useAuthStore from '../../store/authStore';

import { Ionicons } from '@expo/vector-icons';

import {
  validateEmail,
  validatePassword,
  validateName,
  validateUsername,
} from '../../utils/validation';

export default function SignupScreen({ navigation }) {
  const register = useAuthStore((state) => state.register);

  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState('');

  const [username, setUsername] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    // Empty validation
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert('Missing Fields', 'Please fill all fields');
    }

    // Name validation
    if (!validateName(name)) {
      return Alert.alert('Invalid Name', 'Name must be at least 3 characters');
    }

    if (!validateUsername(username)) {
      return Alert.alert(
        'Invalid Username',
        'Username must be at least 3 characters and contain only letters, numbers, and underscores'
      );
    }

    // Email validation
    if (!validateEmail(email)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email');
    }

    // Password validation
    if (!validatePassword(password)) {
      return Alert.alert(
        'Weak Password',
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      );
    }

    // Confirm password
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match');
    }

    const res = await register(name, username, email, password);

    if (!res.success) {
      return Alert.alert('Signup Failed', res.message || 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#071e00] px-6">
      <Text className="mb-2 text-4xl font-bold text-white">Create Account</Text>

      <Text className="mb-10 text-gray-400">Join FitNova today</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        className="mb-4 rounded-2xl bg-[#112b0a] p-4 text-white"
      />

      <TextInput
        placeholder="Username"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        className="mb-4 rounded-2xl bg-[#112b0a] p-4 text-white"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        className="mb-4 rounded-2xl bg-[#112b0a] p-4 text-white"
      />

      <View className="mb-4 flex-row items-center rounded-2xl bg-[#112b0a] px-4">
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          className="flex-1 py-4 text-white"
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <View className="mb-6 flex-row items-center rounded-2xl bg-[#112b0a] px-4">
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="flex-1 py-4 text-white"
        />

        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSignup}
        disabled={loading}
        className="items-center rounded-2xl bg-[#3efe18] p-4">
        {loading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text className="text-lg font-bold text-black">Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
        <Text className="text-center text-gray-400">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
