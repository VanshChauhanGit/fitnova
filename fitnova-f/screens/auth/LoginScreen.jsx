import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useAuthStore from '../../store/authStore';
import { validateEmail } from '../../utils/validation';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const res = await login(email.trim(), password);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#121417' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: insets.top > 0 ? insets.top + 20 : 40,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 40,
          }}>
          {/* Top Brand Logo */}
          <View className="mb-6 items-center">
            <View className="h-16 w-24 items-center justify-center rounded-xl border border-[#2D333B] overflow-hidden">
              <Image
                source={require('../../assets/logo-icon.png')}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="text-3xl font-bold text-[#E8EAED] text-center">Welcome Back</Text>
          <Text className="mb-8 text-center text-sm font-medium text-[#9AA0A6]">
            Log in to continue your fitness streak
          </Text>

          {/* Input Group */}
          <View className="space-y-4">
            {/* Email Input */}
            <Pressable
              onPress={() => emailInputRef.current?.focus()}
              className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${isEmailFocused ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
                }`}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isEmailFocused ? '#2D9CDB' : '#9AA0A6'}
              />
              <TextInput
                ref={emailInputRef}
                placeholder="Email address"
                placeholderTextColor="#9AA0A6"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
                className="flex-1 h-full ml-3 text-md text-[#E8EAED]"
                style={{
                  paddingTop: 0,
                  paddingBottom: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  textAlignVertical: 'center',
                }}
              />
            </Pressable>

            {/* Password Input */}
            <Pressable
              onPress={() => passwordInputRef.current?.focus()}
              className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${isPasswordFocused ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
                }`}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isPasswordFocused ? '#2D9CDB' : '#9AA0A6'}
              />
              <TextInput
                ref={passwordInputRef}
                placeholder="Password"
                placeholderTextColor="#9AA0A6"
                secureTextEntry={!showPassword}
                value={password}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                className="flex-1 h-full ml-3 text-md text-[#E8EAED]"
                style={{
                  paddingTop: 0,
                  paddingBottom: 0,
                  marginTop: 0,
                  marginBottom: 0,
                  textAlignVertical: 'center',
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="p-1">
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={isPasswordFocused ? '#2D9CDB' : '#9AA0A6'}
                />
              </TouchableOpacity>
            </Pressable>
          </View>

          {/* Inline Error Message */}
          {errorMessage ? (
            <View className="mb-4 flex-row items-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 shadow-xs">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="ml-2.5 flex-1 text-xs font-semibold text-red-400">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
            className="items-center rounded-2xl bg-[#2D9CDB] py-4 shadow-lg shadow-[#2D9CDB]/30 border border-[#2D9CDB]/40">
            {loading ? (
              <ActivityIndicator color="#121417" />
            ) : (
              <Text className="text-base font-black text-[#121417]">Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-8 mb-4">
            <Text className="text-center text-sm font-medium text-[#9AA0A6]">
              Don{"'"}t have an account? <Text className="font-bold text-[#2D9CDB]">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
