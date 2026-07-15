import { NavigationContainer } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';

import useAuthStore from '../store/authStore';

import { useEffect } from 'react';

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);

  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // IF PROFILE NOT COMPLETED
  if (!user?.age || !user?.goals || user.goals.length === 0) {
    return (
      <NavigationContainer>
        <ProfileSetupScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
