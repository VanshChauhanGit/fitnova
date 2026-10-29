import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
  Image,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/home/DashboardScreen';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ActiveSessionFloatingBar from '../components/ActiveSessionFloatingBar';
import useAuthStore from '../store/authStore';

const Tab = createBottomTabNavigator();
const PILL_WIDTH = 76;
const PILL_HEIGHT = 48;
const BAR_HEIGHT = 62;

// EXACT INSTAGRAM-STYLE FLOATING GLASS TAB BAR WITH DRAGGABLE ACTIVE PILL
function InstagramFloatingGlassTabBar({ state, descriptors, navigation, insets }) {
  const user = useAuthStore((s) => s.user);
  const bottomMargin = insets.bottom > 0 ? insets.bottom + 6 : 16;
  const floatingSessionBarOffset = bottomMargin + BAR_HEIGHT + 10;

  // Window width fallback for initial layout
  const screenWidth = Dimensions.get('window').width;
  const initialBarWidth = Math.min(screenWidth - 36, 390);

  const [barWidth, setBarWidth] = useState(initialBarWidth);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Animated values for the sliding/draggable active pill (stable instances)
  const [pillAnimX] = useState(() => new Animated.Value(0));
  const [pillScale] = useState(() => new Animated.Value(1));

  const numTabs = state.routes.length;
  const tabWidth = barWidth / numTabs;

  // Calculate target X position for a given tab index
  const getTargetX = useCallback(
    (index) => {
      const offset = (tabWidth - PILL_WIDTH) / 2;
      return index * tabWidth + offset;
    },
    [tabWidth]
  );

  // Smooth spring transition whenever state.index changes (and not dragging)
  useEffect(() => {
    if (!isDragging) {
      const target = getTargetX(state.index);
      Animated.spring(pillAnimX, {
        toValue: target,
        friction: 7,
        tension: 80,
        useNativeDriver: false,
      }).start();
    }
  }, [state.index, isDragging, getTargetX, pillAnimX]);

  // Dynamic layout width update
  const handleLayout = (e) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - barWidth) > 1) {
      setBarWidth(width);
      const target = (width / numTabs - PILL_WIDTH) / 2 + state.index * (width / numTabs);
      pillAnimX.setValue(target);
    }
  };

  const endDrag = useCallback(() => {
    pillAnimX.flattenOffset();
    const currentTabW = barWidth / numTabs;
    const currentMinX = (currentTabW - PILL_WIDTH) / 2;
    const finalX = pillAnimX._value;

    // Find closest tab to snap into
    const targetIndex = Math.max(
      0,
      Math.min(numTabs - 1, Math.round((finalX - currentMinX) / currentTabW))
    );

    const targetPos = targetIndex * currentTabW + currentMinX;

    // Spring snap to the chosen tab
    Animated.parallel([
      Animated.spring(pillAnimX, {
        toValue: targetPos,
        friction: 6,
        tension: 85,
        useNativeDriver: false,
      }),
      Animated.spring(pillScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsDragging(false);
      setHoveredIndex(null);
    });

    // "and when drops that screen opens"
    const targetRoute = state.routes[targetIndex];
    if (targetRoute) {
      navigation.navigate(targetRoute.name);
    }
  }, [barWidth, numTabs, pillAnimX, pillScale, state.routes, navigation]);

  // PAN RESPONDER: Detects horizontal drag of the active pill across tabs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 6;
      },
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 6;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);

        Animated.spring(pillScale, {
          toValue: 1.1,
          friction: 6,
          tension: 100,
          useNativeDriver: false,
        }).start();

        pillAnimX.setOffset(pillAnimX._value);
        pillAnimX.setValue(0);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const startX = pillAnimX._offset || 0;
        const currentTabW = barWidth / numTabs;
        const minPillX = (currentTabW - PILL_WIDTH) / 2;
        const maxPillX = (numTabs - 1) * currentTabW + minPillX;
        const clampedDx = Math.max(minPillX - startX, Math.min(maxPillX - startX, gestureState.dx));
        pillAnimX.setValue(clampedDx);

        const currentX = startX + clampedDx;
        const hovered = Math.max(
          0,
          Math.min(numTabs - 1, Math.round((currentX - minPillX) / currentTabW))
        );
        setHoveredIndex(hovered);
      },
      onPanResponderRelease: () => {
        endDrag();
      },
      onPanResponderTerminate: () => {
        endDrag();
      },
    })
  );

  const getTabIcon = (routeName, focused) => {
    switch (routeName) {
      case 'Dashboard':
        return focused ? 'home' : 'home-outline';
      case 'Exercises':
        return focused ? 'barbell' : 'barbell-outline';
      case 'Progress':
        return focused ? 'stats-chart' : 'stats-chart-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <>
      {/* FLOATING ACTIVE WORKOUT HUD (ANCHORED ABOVE THE PILL) */}
      <ActiveSessionFloatingBar navigation={navigation} bottomOffset={floatingSessionBarOffset} />

      {/* FIXED FLOATING GLASS BAR CONTAINER */}
      <View
        style={[styles.outerContainer, { bottom: bottomMargin }]}
        pointerEvents="box-none">
        <View style={styles.shadowWrapper}>
          <View style={styles.pillBarContainer}>
            {/* FROSTED GLASS BACKDROP BLUR */}
            <BlurView
              intensity={Platform.OS === 'ios' ? 75 : 95}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />

            {/* TRANSLUCENT OBSIDIAN TINT OVERLAY */}
            <View style={styles.glassTintOverlay} />

            {/* SLIDING / DRAGGABLE ACTIVE PILL INDICATOR */}
            <Animated.View
              style={[
                styles.slidingActivePill,
                isDragging && styles.slidingActivePillDragging,
                {
                  transform: [
                    { translateX: pillAnimX },
                    { scale: pillScale },
                  ],
                },
              ]}
              pointerEvents="none"
            />

            {/* TAB BUTTONS TRACK WITH DRAG / SWIPE PAN RESPONDER */}
            <View
              {...panResponder.panHandlers}
              style={styles.tabsRow}
              onLayout={handleLayout}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = isDragging
                  ? hoveredIndex === index
                  : state.index === index;
                const iconName = getTabIcon(route.name, isFocused);

                const onPress = () => {
                  if (isDragging) return;
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (state.index !== index && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={onPress}
                    activeOpacity={0.7}
                    style={styles.tabButton}>
                    {route.name === 'Profile' ? (
                      <View style={styles.profileAvatarWrapper}>
                        <Image
                          source={{
                            uri:
                              user?.profileImage ||
                              (user?.gender === 'male'
                                ? 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?q=80&w=580&auto=format&fit=crop'
                                : 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=500&auto=format&fit=crop'),
                          }}
                          style={[
                            styles.profileAvatar,
                            isFocused && styles.profileAvatarFocused,
                          ]}
                        />
                        {/* INSTAGRAM-STYLE NOTIFICATION BADGE ON PROFILE */}
                        <View style={styles.notificationDot} />
                      </View>
                    ) : (
                      <Ionicons
                        name={iconName}
                        size={24}
                        color={isFocused ? '#FFFFFF' : '#9AA0A6'}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramFloatingGlassTabBar {...props} insets={insets} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Exercises" component={WorkoutScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
    zIndex: 40,
  },
  shadowWrapper: {
    width: '100%',
    maxWidth: 390,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 20,
  },
  pillBarContainer: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(18, 20, 23, 0.72)',
    position: 'relative',
    justifyContent: 'center',
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 23, 0.65)',
  },
  // DRAGGABLE / SLIDING ACTIVE PILL INDICATOR
  slidingActivePill: {
    position: 'absolute',
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    left: 0,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  slidingActivePillDragging: {
    borderColor: '#2D9CDB',
    backgroundColor: 'rgba(45, 156, 219, 0.28)',
    shadowColor: '#2D9CDB',
    shadowOpacity: 0.55,
    shadowRadius: 12,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#9AA0A6',
  },
  profileAvatarFocused: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  notificationDot: {
    position: 'absolute',
    bottom: -1,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#121417',
  },
});
