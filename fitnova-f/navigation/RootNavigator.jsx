import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import useAuthStore from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : !user?.age || !user?.goals || user.goals.length === 0 ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
}
