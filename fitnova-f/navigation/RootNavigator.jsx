import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import useAuthStore from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !user?.age || !user?.goals || user.goals.length === 0 ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}
