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
  ScrollView,
} from 'react-native';

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        className="bg-[#0B0E14] px-6 py-12">
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-3xl bg-[#10B981]/10 border border-[#10B981]/20">
            <Ionicons name="person-add-outline" size={28} color="#10B981" />
          </View>
        </View>

        <Text className="text-3xl font-black text-white text-center">Create Account</Text>
        <Text className="mb-8 text-center text-sm font-medium text-slate-400">
          Join FitNova and kickstart your transformation
        </Text>

        {/* Full Name */}
        <View className="mb-4 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
          <Ionicons name="person-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
            className="flex-1 ml-3 text-md text-white"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              textAlignVertical: 'center',
            }}
          />
        </View>

        {/* Username */}
        <View className="mb-4 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
          <Ionicons name="at-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            className="flex-1 ml-3 text-md text-white"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              textAlignVertical: 'center',
            }}
          />
        </View>

        {/* Email */}
        <View className="mb-4 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
          <Ionicons name="mail-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Email address"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="flex-1 ml-3 text-md text-white"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              textAlignVertical: 'center',
            }}
          />
        </View>

        {/* Password */}
        <View className="mb-4 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
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

        {/* Confirm Password */}
        <View className="mb-6 h-14 flex-row items-center rounded-2xl border border-slate-800 bg-[#151B26] px-4">
          <Ionicons name="shield-checkmark-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#64748B"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="flex-1 ml-3 text-md text-white"
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              textAlignVertical: 'center',
            }}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSignup}
          disabled={loading}
          className="items-center rounded-2xl bg-[#10B981] py-4 shadow-lg shadow-emerald-950/40">
          {loading ? (
            <ActivityIndicator color="#0B0E14" />
          ) : (
            <Text className="text-base font-bold text-[#0B0E14]">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6 mb-8">
          <Text className="text-center text-sm font-medium text-slate-400">
            Already have an account? <Text className="font-bold text-[#10B981]">Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
