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
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateUsername,
} from '../../utils/validation';

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const nameInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [focusedField, setFocusedField] = useState(null);

  const handleSignup = async () => {
    setErrorMessage('');

    if (!name.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!validateName(name.trim())) {
      setErrorMessage('Full Name must be at least 3 characters.');
      return;
    }

    if (!validateUsername(username.trim())) {
      setErrorMessage('Username must be at least 3 characters (letters, numbers, underscores).');
      return;
    }

    if (!validateEmail(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be 8+ chars with uppercase, lowercase, number & special char.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    const res = await register(name.trim(), username.trim(), email.trim(), password);
    if (!res.success) {
      setErrorMessage(res.message || 'Signup failed. Please try again.');
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
            paddingTop: insets.top > 0 ? insets.top + 20 : 36,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 36 : 48,
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

          <Text className="text-3xl font-bold text-[#E8EAED] text-center">Create Account</Text>
          <Text className="mb-8 text-center text-sm font-medium text-[#9AA0A6]">
            Join FitNova and kickstart your transformation
          </Text>

          {/* Full Name */}
          <Pressable
            onPress={() => nameInputRef.current?.focus()}
            className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${
              focusedField === 'name' ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
            }`}>
            <Ionicons
              name="person-outline"
              size={20}
              color={focusedField === 'name' ? '#2D9CDB' : '#9AA0A6'}
            />
            <TextInput
              ref={nameInputRef}
              placeholder="Full Name"
              placeholderTextColor="#9AA0A6"
              value={name}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => {
                setName(text);
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

          {/* Username */}
          <Pressable
            onPress={() => usernameInputRef.current?.focus()}
            className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${
              focusedField === 'username' ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
            }`}>
            <Ionicons
              name="at-outline"
              size={20}
              color={focusedField === 'username' ? '#2D9CDB' : '#9AA0A6'}
            />
            <TextInput
              ref={usernameInputRef}
              placeholder="Username"
              placeholderTextColor="#9AA0A6"
              autoCapitalize="none"
              value={username}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => {
                setUsername(text);
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

          {/* Email */}
          <Pressable
            onPress={() => emailInputRef.current?.focus()}
            className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${
              focusedField === 'email' ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
            }`}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedField === 'email' ? '#2D9CDB' : '#9AA0A6'}
            />
            <TextInput
              ref={emailInputRef}
              placeholder="Email address"
              placeholderTextColor="#9AA0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
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

          {/* Password */}
          <Pressable
            onPress={() => passwordInputRef.current?.focus()}
            className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${
              focusedField === 'password' ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
            }`}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedField === 'password' ? '#2D9CDB' : '#9AA0A6'}
            />
            <TextInput
              ref={passwordInputRef}
              placeholder="Password"
              placeholderTextColor="#9AA0A6"
              secureTextEntry={!showPassword}
              value={password}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
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
                color={focusedField === 'password' ? '#2D9CDB' : '#9AA0A6'}
              />
            </TouchableOpacity>
          </Pressable>

          {/* Confirm Password */}
          <Pressable
            onPress={() => confirmPasswordInputRef.current?.focus()}
            className={`mb-4 h-14 flex-row items-center rounded-2xl border px-4 shadow-sm bg-[#1F2328] ${
              focusedField === 'confirmPassword' ? 'border-[#2D9CDB]' : 'border-[#2D333B]'
            }`}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={focusedField === 'confirmPassword' ? '#2D9CDB' : '#9AA0A6'}
            />
            <TextInput
              ref={confirmPasswordInputRef}
              placeholder="Confirm Password"
              placeholderTextColor="#9AA0A6"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(text) => {
                setConfirmPassword(text);
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
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="p-1">
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={focusedField === 'confirmPassword' ? '#2D9CDB' : '#9AA0A6'}
              />
            </TouchableOpacity>
          </Pressable>

          {/* Inline Error Message */}
          {errorMessage ? (
            <View className="mb-4 flex-row items-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 shadow-xs">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="ml-2.5 flex-1 text-xs font-semibold text-red-400">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSignup}
            disabled={loading}
            className="items-center rounded-2xl bg-[#2D9CDB] py-4 shadow-lg shadow-[#2D9CDB]/30 border border-[#2D9CDB]/40 mt-2">
            {loading ? (
              <ActivityIndicator color="#121417" />
            ) : (
              <Text className="text-base font-black text-[#121417]">Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6 mb-8">
            <Text className="text-center text-sm font-medium text-[#9AA0A6]">
              Already have an account? <Text className="font-bold text-[#2D9CDB]">Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
