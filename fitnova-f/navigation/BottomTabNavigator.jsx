import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/home/DashboardScreen';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0B0E14',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 60 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={95}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ),
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Dashboard') {
            return (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === 'Exercises') {
            return (
              <MaterialCommunityIcons
                name="dumbbell"
                size={26}
                color={color}
              />
            );
          }
          if (route.name === 'Progress') {
            return (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={24}
                color={color}
              />
            );
          }
          if (route.name === 'Profile') {
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={color}
              />
            );
          }
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Exercises" component={WorkoutScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
