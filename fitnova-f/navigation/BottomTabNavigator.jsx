import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/home/DashboardScreen';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#3efe18',

        tabBarInactiveTintColor: '#888',

        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },

        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              flex: 1,
            }}
          />
        ),

        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Dashboard') {
            return (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={focused ? 30 : 24}
                color={color}
              />
            );
          }

          if (route.name === 'Workout') {
            return (
              <MaterialCommunityIcons name="dumbbell" size={focused ? 30 : 24} color={color} />
            );
          }

          if (route.name === 'Progress') {
            return (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={focused ? 30 : 24}
                color={color}
              />
            );
          }

          if (route.name === 'Profile') {
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={focused ? 30 : 24}
                color={color}
              />
            );
          }
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      <Tab.Screen name="Workout" component={WorkoutScreen} />

      <Tab.Screen name="Progress" component={ProgressScreen} />

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
