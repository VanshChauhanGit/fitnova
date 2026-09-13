import { View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/home/DashboardScreen';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ActiveSessionFloatingBar from '../components/ActiveSessionFloatingBar';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <View>
          <ActiveSessionFloatingBar navigation={navigation} bottomOffset={64 + bottomPadding} />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#017374',
        tabBarInactiveTintColor: '#3A7574',
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
          backgroundColor: '#EBF7F4',
          borderTopWidth: 1,
          borderTopColor: 'rgba(1, 115, 116, 0.18)',
          height: 60 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={95}
            tint="light"
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
              <Ionicons
                name={focused ? 'barbell' : 'barbell-outline'}
                size={24}
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
