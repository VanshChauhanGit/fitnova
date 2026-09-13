import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useWorkoutStore from '../../store/workoutStore';
import useAuthStore from '../../store/authStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const {
    workoutHistory,
    analytics,
    fetchWorkoutHistory,
    fetchAnalytics,
    deleteWorkoutFromHistory,
  } = useWorkoutStore();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'push' | 'pull' | 'legs' | 'quick'
  const [expandedMap, setExpandedMap] = useState({});

  useEffect(() => {
    fetchWorkoutHistory();
    fetchAnalytics();
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatSeconds = (totalSec) => {
    if (!totalSec || isNaN(totalSec)) return '0m';
    const mins = Math.floor(totalSec / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}m ${totalSec % 60}s`;
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recent';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Recent';

      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today at ${timeStr}`;
      }

      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      return `${dateStr} • ${timeStr}`;
    } catch (_e) {
      return 'Recent';
    }
  };

  // Calculate totals from workout history
  const historyList = Array.isArray(workoutHistory) ? workoutHistory : [];

  let totalVolumeKg = 0;
  let totalTimeSec = 0;
  let totalSetsLogged = 0;

  historyList.forEach((w) => {
    totalTimeSec += w.duration || 0;
    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        if (s.completed || s.completed === undefined) {
          const weight = parseFloat(s.weight) || 0;
          const reps = parseInt(s.reps, 10) || 0;
          totalVolumeKg += weight * reps;
          totalSetsLogged += 1;
        }
      });
    });
  });

  const totalWorkoutsCount = historyList.length;

  // Filter history
  const filteredHistory = historyList.filter((w) => {
    if (activeFilter === 'all') return true;
    const title = (w.title || '').toLowerCase();
    if (activeFilter === 'push') return title.includes('push');
    if (activeFilter === 'pull') return title.includes('pull');
    if (activeFilter === 'legs') return title.includes('leg');
    if (activeFilter === 'quick') return title.includes('quick') || title.includes('freestyle');
    return true;
  });

  // Chart data setup (Last 7 workouts or baseline)
  const chartWorkouts = [...historyList].reverse().slice(-7);
  const chartLabels = chartWorkouts.length > 0
    ? chartWorkouts.map((w, idx) => {
        const d = new Date(w.createdAt || Date.now());
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return chartWorkouts.length <= 5 ? (days[d.getDay()] || `W${idx+1}`) : `W${idx+1}`;
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartDataPoints = chartWorkouts.length > 0
    ? chartWorkouts.map((w) => {
        let vol = 0;
        (w.exercises || []).forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (s.completed || s.completed === undefined) {
              vol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
            }
          });
        });
        return Math.round(vol);
      })
    : [0, 0, 0, 0, 0, 0, 0];

  const handleDeleteWorkout = (workout) => {
    const workoutId = workout.id || workout._id;
    Alert.alert(
      'Delete Workout Entry',
      `Are you sure you want to delete "${workout.title || 'Workout Session'}" from your history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteWorkoutFromHistory(workoutId);
            if (res.success) {
              Alert.alert('Deleted', 'Workout session removed from history.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#EBF7F4] px-5 pt-16" showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-black text-[#014041]">Analytics & History</Text>
          <Text className="mt-1 text-xs font-bold text-[#3A7574]">
            Performance progress & logged workouts
          </Text>
        </View>
        <View className="rounded-2xl bg-[#017374]/15 px-3.5 py-2 border border-[#017374]/25">
          <Text className="text-xs font-black uppercase text-[#017374]">
            {user?.name ? `${user.name}'s Stats` : 'Athlete Stats'}
          </Text>
        </View>
      </View>

      {/* OVERVIEW STATS GRID */}
      <View className="mt-6 flex-row flex-wrap justify-between">
        {/* Workouts Count */}
        <View className="mb-3.5 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4.5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-extrabold text-[#3A7574]">Workouts Logged</Text>
            <View className="rounded-xl bg-[#017374]/15 p-2 border border-[#017374]/20">
              <MaterialCommunityIcons name="dumbbell" size={18} color="#017374" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">{totalWorkoutsCount}</Text>
          <Text className="mt-0.5 text-[11px] font-bold text-[#017374]">Sessions completed</Text>
        </View>

        {/* Volume Lifted */}
        <View className="mb-3.5 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4.5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-extrabold text-[#3A7574]">Total Volume</Text>
            <View className="rounded-xl bg-orange-500/10 p-2 border border-orange-500/20">
              <MaterialCommunityIcons name="weight-kilogram" size={18} color="#F97316" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">
            {totalVolumeKg >= 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}t` : `${Math.round(totalVolumeKg)}kg`}
          </Text>
          <Text className="mt-0.5 text-[11px] font-bold text-[#017374]">Weight lifted total</Text>
        </View>

        {/* Total Time */}
        <View className="mb-3.5 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4.5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-extrabold text-[#3A7574]">Active Time</Text>
            <View className="rounded-xl bg-[#017374]/15 p-2 border border-[#017374]/20">
              <Ionicons name="timer-outline" size={18} color="#017374" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">{formatSeconds(totalTimeSec)}</Text>
          <Text className="mt-0.5 text-[11px] font-bold text-[#017374]">Time in session</Text>
        </View>

        {/* Streak */}
        <View className="mb-3.5 w-[48%] rounded-3xl border border-[#017374]/15 bg-white p-4.5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-extrabold text-[#3A7574]">Current Streak</Text>
            <View className="rounded-xl bg-amber-500/15 p-2 border border-amber-500/25">
              <Ionicons name="flame" size={18} color="#D97706" />
            </View>
          </View>
          <Text className="mt-2 text-3xl font-black text-[#014041]">
            {analytics?.streak || (totalWorkoutsCount > 0 ? 3 : 0)} <Text className="text-base font-bold">Days</Text>
          </Text>
          <Text className="mt-0.5 text-[11px] font-bold text-amber-700">Consistency streak 🔥</Text>
        </View>
      </View>

      {/* CHART CARD */}
      <View className="mt-3 rounded-3xl border border-[#017374]/15 bg-white p-5 shadow-md">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-lg font-black text-[#014041]">Volume Lifted Progression</Text>
            <Text className="text-xs font-bold text-[#3A7574]">Cumulative kg per workout session</Text>
          </View>
          <View className="flex-row items-center rounded-xl bg-[#017374]/15 px-3 py-1 border border-[#017374]/25">
            <Ionicons name="trending-up" size={16} color="#017374" />
            <Text className="ml-1 text-xs font-black text-[#017374]">kg Volume</Text>
          </View>
        </View>

        <LineChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: chartDataPoints.length > 0 ? chartDataPoints : [0, 0, 0, 0, 0],
              },
            ],
          }}
          width={screenWidth - 64}
          height={200}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(1, 115, 116, ${opacity})`,
            labelColor: () => '#3A7574',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#017374',
              fill: '#EBF7F4',
            },
          }}
          bezier
          style={{
            borderRadius: 16,
            marginVertical: 8,
          }}
        />
      </View>

      {/* WORKOUT HISTORY FEED HEADER */}
      <View className="mt-8 flex-row items-center justify-between">
        <Text className="text-xl font-black text-[#014041]">Workout History Log</Text>
        <View className="rounded-full bg-[#017374]/15 px-3 py-1 border border-[#017374]/25">
          <Text className="text-xs font-extrabold text-[#017374]">
            {filteredHistory.length} Logged
          </Text>
        </View>
      </View>

      {/* FILTER CHIPS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-3 mb-4">
        {[
          { key: 'all', label: 'All Sessions' },
          { key: 'push', label: 'Push Routine' },
          { key: 'pull', label: 'Pull Routine' },
          { key: 'legs', label: 'Legs Routine' },
          { key: 'quick', label: 'Quick / Freestyle' },
        ].map((chip) => (
          <TouchableOpacity
            key={chip.key}
            onPress={() => setActiveFilter(chip.key)}
            className={`mr-2 rounded-xl border px-3.5 py-2 ${
              activeFilter === chip.key
                ? 'border-[#017374] bg-[#017374]'
                : 'border-[#017374]/20 bg-white shadow-xs'
            }`}>
            <Text
              className={`text-xs font-extrabold ${
                activeFilter === chip.key ? 'text-white' : 'text-[#025C5D]'
              }`}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* WORKOUT HISTORY LIST */}
      {filteredHistory.length === 0 ? (
        <View className="rounded-3xl border border-dashed border-[#017374]/30 bg-white p-8 items-center mt-2 shadow-xs mb-10">
          <View className="rounded-2xl bg-[#017374]/15 p-4 mb-3 border border-[#017374]/20">
            <MaterialCommunityIcons name="clipboard-text-outline" size={44} color="#017374" />
          </View>
          <Text className="text-base font-black text-[#014041]">No Workout History Found</Text>
          <Text className="text-xs text-[#025C5D] text-center mt-1 mb-5 px-4">
            {activeFilter !== 'all'
              ? `No completed workout logs found matching filter "${activeFilter}".`
              : 'Complete your first workout session to log sets, reps, duration, and progressive volume!'}
          </Text>
          {navigation?.navigate && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Tabs', { screen: 'Dashboard' })}
              className="flex-row items-center rounded-2xl bg-[#017374] px-5 py-3.5 shadow-md border border-[#017374]/20">
              <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text className="text-xs font-extrabold text-white uppercase tracking-wider">Start Workout Session</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        filteredHistory.map((workout, idx) => {
          const workoutId = workout.id || workout._id || `w-${idx}`;
          const isExpanded = !!expandedMap[workoutId];

          let workoutVol = 0;
          let totalSetsCount = 0;
          const exercisesList = workout.exercises || [];

          exercisesList.forEach((ex) => {
            (ex.sets || []).forEach((s) => {
              if (s.completed || s.completed === undefined) {
                workoutVol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
                totalSetsCount += 1;
              }
            });
          });

          return (
            <View
              key={workoutId}
              className="mb-4 overflow-hidden rounded-3xl border border-[#017374]/20 bg-white shadow-sm">
              {/* CARD MAIN BAR (TOUCHABLE TO TOGGLE ACCORDION) */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleExpand(workoutId)}
                className="p-4.5 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="rounded-2xl bg-[#017374]/15 p-3 border border-[#017374]/25 mr-3">
                    <MaterialCommunityIcons name="arm-flex" size={22} color="#017374" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-black text-[#014041]" numberOfLines={1}>
                      {workout.title || workout.name || 'Workout Session'}
                    </Text>
                    <Text className="text-xs font-medium text-[#3A7574] mt-0.5">
                      {formatDate(workout.createdAt)}
                    </Text>
                  </View>
                </View>

                <View className="items-end">
                  <View className="rounded-full bg-[#EBF7F4] px-2.5 py-1 border border-[#017374]/15 flex-row items-center mb-1">
                    <Ionicons name="timer-outline" size={13} color="#017374" style={{ marginRight: 3 }} />
                    <Text className="text-[11px] font-extrabold text-[#017374]">
                      {formatSeconds(workout.duration)}
                    </Text>
                  </View>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#3A7574"
                  />
                </View>
              </TouchableOpacity>

              {/* QUICK STATS BAR */}
              <View className="px-4.5 pb-3 flex-row items-center justify-between border-b border-[#017374]/10">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-xs font-bold text-[#025C5D]">
                    📊 {exercisesList.length} Exercise{exercisesList.length !== 1 ? 's' : ''}
                  </Text>
                  <Text className="text-xs text-[#3A7574]">•</Text>
                  <Text className="text-xs font-bold text-[#025C5D]">
                    {totalSetsCount} Set{totalSetsCount !== 1 ? 's' : ''}
                  </Text>
                </View>

                <Text className="text-xs font-extrabold text-[#017374]">
                  {Math.round(workoutVol)} kg Volume
                </Text>
              </View>

              {/* EXPANDABLE EXERCISE SET BREAKDOWN */}
              {isExpanded && (
                <View className="bg-[#EBF7F4]/40 p-4 border-t border-[#017374]/10">
                  <Text className="text-[11px] font-extrabold text-[#3A7574] uppercase tracking-wider mb-2.5">
                    Exercise Details Breakdown
                  </Text>

                  {exercisesList.map((ex, exIdx) => {
                    const completedSets = (ex.sets || []).filter((s) => s.completed || s.completed === undefined);

                    return (
                      <View
                        key={ex.exerciseId || exIdx}
                        className="mb-3 rounded-2xl border border-[#017374]/15 bg-white p-3">
                        <View className="flex-row items-center justify-between pb-2 border-b border-[#017374]/10">
                          <Text className="text-xs font-extrabold text-[#014041]">
                            {exIdx + 1}. {ex.name}
                          </Text>
                          <View className="rounded-md bg-[#017374]/15 px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-[#017374] uppercase">
                              {ex.bodyPart || 'General'}
                            </Text>
                          </View>
                        </View>

                        {/* SETS CHIPS LIST */}
                        <View className="mt-2 flex-row flex-wrap gap-1.5">
                          {completedSets.length === 0 ? (
                            <Text className="text-[11px] text-[#3A7574] italic">No sets recorded.</Text>
                          ) : (
                            completedSets.map((s, sIdx) => (
                              <View
                                key={sIdx}
                                className="rounded-xl border border-[#017374]/20 bg-[#EBF7F4] px-2.5 py-1 flex-row items-center">
                                <Text className="text-[10px] font-bold text-[#017374] mr-1">
                                  S{sIdx + 1}:
                                </Text>
                                <Text className="text-[11px] font-extrabold text-[#014041]">
                                  {s.weight || 0}kg × {s.reps || 0}
                                </Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {/* DELETE WORKOUT BUTTON */}
                  <TouchableOpacity
                    onPress={() => handleDeleteWorkout(workout)}
                    className="mt-2 self-end flex-row items-center rounded-xl bg-red-500/10 px-3 py-1.5 border border-red-500/20">
                    <Ionicons name="trash-outline" size={14} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text className="text-xs font-bold text-red-500">Delete Entry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}

      <View className="h-32" />
    </ScrollView>
  );
}
