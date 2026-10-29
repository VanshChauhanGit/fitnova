import React, { useState, useEffect, useMemo } from 'react';
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
  TextInput,
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exercise' | 'history'
  const [timeFrame, setTimeFrame] = useState('all'); // '7d' | '30d' | 'all'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'push' | 'pull' | 'legs' | 'quick'
  const [expandedMap, setExpandedMap] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseSearch, setExerciseSearch] = useState('');

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

      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} • ${timeStr}`;
    } catch (_e) {
      return 'Recent';
    }
  };

  const historyList = useMemo(() => (Array.isArray(workoutHistory) ? workoutHistory : []), [workoutHistory]);

  // Filter history by time frame
  const filteredTimeHistory = useMemo(() => {
    if (timeFrame === 'all') return historyList;
    const now = new Date();
    const daysLimit = timeFrame === '7d' ? 7 : 30;
    return historyList.filter((w) => {
      const date = new Date(w.createdAt || Date.now());
      const diffMs = now.getTime() - date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= daysLimit;
    });
  }, [historyList, timeFrame]);

  // Calculate overall metrics
  const { totalVolumeKg, totalTimeSec, totalWorkoutsCount, muscleDist, prHallOfFame, allExercises } = useMemo(() => {
    let volume = 0;
    let timeSec = 0;
    const muscleMap = {};
    const exercisePRs = {};

    filteredTimeHistory.forEach((w) => {
      timeSec += w.duration || 0;
      (w.exercises || []).forEach((ex) => {
        const bodyPart = ex.bodyPart || 'General';
        muscleMap[bodyPart] = (muscleMap[bodyPart] || 0) + (ex.sets ? ex.sets.length : 1);

        (ex.sets || []).forEach((s) => {
          if (s.completed || s.completed === undefined) {
            const weight = parseFloat(s.weight) || 0;
            const reps = parseInt(s.reps, 10) || 0;
            volume += weight * reps;

            if (ex.name && weight > 0) {
              if (!exercisePRs[ex.name] || weight > exercisePRs[ex.name].maxWeight) {
                exercisePRs[ex.name] = {
                  exerciseName: ex.name,
                  bodyPart,
                  maxWeight: weight,
                  reps,
                  date: w.createdAt,
                };
              }
            }
          }
        });
      });
    });

    const prList = Object.values(exercisePRs).sort((a, b) => b.maxWeight - a.maxWeight);

    // Get unique list of exercise names
    const exerciseNamesList = Array.from(
      new Set(historyList.flatMap((w) => (w.exercises || []).map((ex) => ex.name)).filter(Boolean))
    );

    return {
      totalVolumeKg: volume,
      totalTimeSec: timeSec,
      totalWorkoutsCount: filteredTimeHistory.length,
      muscleDist: muscleMap,
      prHallOfFame: prList.slice(0, 4),
      allExercises: exerciseNamesList.length > 0 ? exerciseNamesList : ['Barbell Bench Press', 'Barbell Back Squat', 'Conventional Deadlift', 'Incline Dumbbell Press', 'Lat Pulldowns', 'Bicep Curls'],
    };
  }, [filteredTimeHistory, historyList]);

  // Auto-select first exercise if none selected
  useEffect(() => {
    if (!selectedExercise && allExercises.length > 0) {
      setSelectedExercise(allExercises[0]);
    }
  }, [allExercises, selectedExercise]);

  // EXERCISE-SPECIFIC PROGRESS CALCULATION
  const exerciseProgressData = useMemo(() => {
    if (!selectedExercise) return null;

    // Filter workout logs containing selected exercise sorted chronologically
    const chronologicalHistory = [...historyList].reverse();
    const exerciseLogs = [];

    chronologicalHistory.forEach((w) => {
      const matchEx = (w.exercises || []).find((e) => e.name?.toLowerCase() === selectedExercise?.toLowerCase());
      if (matchEx) {
        const completedSets = (matchEx.sets || []).filter((s) => s.completed || s.completed === undefined);
        let maxW = 0;
        let sessionVol = 0;
        let bestSet = null;

        completedSets.forEach((s) => {
          const wgt = parseFloat(s.weight) || 0;
          const rps = parseInt(s.reps, 10) || 0;
          sessionVol += wgt * rps;
          if (wgt >= maxW) {
            maxW = wgt;
            bestSet = { weight: wgt, reps: rps };
          }
        });

        const est1RM = bestSet ? Math.round(bestSet.weight * (1 + bestSet.reps / 30)) : 0;

        exerciseLogs.push({
          date: w.createdAt,
          workoutTitle: w.title || w.name || 'Workout Session',
          maxWeight: maxW,
          totalVolume: sessionVol,
          est1RM,
          bestSet,
          sets: completedSets,
          bodyPart: matchEx.bodyPart || 'General',
        });
      }
    });

    if (exerciseLogs.length === 0) return null;

    const maxWeightEver = Math.max(...exerciseLogs.map((l) => l.maxWeight));
    const max1RMEver = Math.max(...exerciseLogs.map((l) => l.est1RM));
    const totalExerciseSets = exerciseLogs.reduce((acc, l) => acc + l.sets.length, 0);

    const firstWeight = exerciseLogs[0].maxWeight || 1;
    const lastWeight = exerciseLogs[exerciseLogs.length - 1].maxWeight || 1;
    const growthPercent = Math.round(((lastWeight - firstWeight) / firstWeight) * 100);

    // Chart labels and points
    const labels = exerciseLogs.slice(-6).map((l) => {
      const d = new Date(l.date || Date.now());
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const weightPoints = exerciseLogs.slice(-6).map((l) => l.maxWeight);

    return {
      name: selectedExercise,
      logs: exerciseLogs,
      maxWeightEver,
      max1RMEver,
      totalExerciseSets,
      growthPercent,
      chartLabels: labels.length > 0 ? labels : ['Day 1'],
      chartPoints: weightPoints.length > 0 ? weightPoints : [0],
    };
  }, [selectedExercise, historyList]);

  // Overall volume chart data setup
  const chartWorkouts = useMemo(() => [...filteredTimeHistory].reverse().slice(-7), [filteredTimeHistory]);

  const chartLabels = useMemo(() => {
    if (chartWorkouts.length === 0) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return chartWorkouts.map((w, idx) => {
      const d = new Date(w.createdAt || Date.now());
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return chartWorkouts.length <= 5 ? days[d.getDay()] : `S${idx + 1}`;
    });
  }, [chartWorkouts]);

  const chartDataPoints = useMemo(() => {
    if (chartWorkouts.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    return chartWorkouts.map((w) => {
      let vol = 0;
      (w.exercises || []).forEach((ex) => {
        (ex.sets || []).forEach((s) => {
          if (s.completed || s.completed === undefined) {
            vol += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
          }
        });
      });
      return Math.round(vol);
    });
  }, [chartWorkouts]);

  // Filter history list for History Tab
  const filteredHistoryFeed = useMemo(() => {
    return filteredTimeHistory.filter((w) => {
      if (activeFilter === 'all') return true;
      const title = (w.title || '').toLowerCase();
      if (activeFilter === 'push') return title.includes('push');
      if (activeFilter === 'pull') return title.includes('pull');
      if (activeFilter === 'legs') return title.includes('leg');
      if (activeFilter === 'quick') return title.includes('quick') || title.includes('freestyle');
      return true;
    });
  }, [filteredTimeHistory, activeFilter]);

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

  const filteredExerciseList = allExercises.filter((ex) =>
    ex.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-[#121417] px-4 pt-14" showsVerticalScrollIndicator={false}>
      {/* HEADER BAR */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-black text-[#E8EAED]">Analytics & Progress</Text>
          <Text className="mt-0.5 text-xs font-bold text-[#9AA0A6]">
            Performance metrics & exercise progression
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation?.navigate && navigation.navigate('Tabs', { screen: 'Dashboard' })}
          className="rounded-2xl bg-[#2D9CDB] px-3.5 py-2 shadow-sm border border-[#2D9CDB] flex-row items-center">
          <Ionicons name="play" size={14} color="#121417" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-[#121417] uppercase">Start</Text>
        </TouchableOpacity>
      </View>

      {/* NAVIGATION MODE TABS */}
      <View className="mt-5 flex-row rounded-2xl bg-[#1F2328] p-1 border border-[#2D333B] shadow-xs">
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'exercise', label: '🏋️ Exercise Stats' },
          { key: 'history', label: '📜 Log History' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              activeTab === tab.key ? 'bg-[#2D9CDB] shadow-sm' : 'bg-transparent'
            }`}>
            <Text
              className={`text-xs font-extrabold ${
                activeTab === tab.key ? 'text-[#121417]' : 'text-[#9AA0A6]'
              }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TIMEFRAME SELECTOR */}
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-xs font-black text-[#9AA0A6] uppercase tracking-wider">
          Time Period:
        </Text>
        <View className="flex-row rounded-xl bg-[#1F2328] p-1 border border-[#2D333B]">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: 'all', label: 'All Time' },
          ].map((tf) => (
            <TouchableOpacity
              key={tf.key}
              onPress={() => setTimeFrame(tf.key)}
              className={`px-3 py-1 rounded-lg ${
                timeFrame === tf.key ? 'bg-[#2D9CDB]/15 border border-[#2D9CDB]/30' : ''
              }`}>
              <Text
                className={`text-[11px] font-extrabold ${
                  timeFrame === tf.key ? 'text-[#2D9CDB]' : 'text-[#9AA0A6]'
                }`}>
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <View className="mt-4">
          {/* STAT CARDS GRID */}
          <View className="flex-row flex-wrap justify-between">
            {/* Workouts Logged */}
            <View className="mb-3.5 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-[#9AA0A6]">Workouts Logged</Text>
                <View className="rounded-xl bg-[#2D9CDB]/15 p-2 border border-[#2D9CDB]/20">
                  <MaterialCommunityIcons name="dumbbell" size={18} color="#2D9CDB" />
                </View>
              </View>
              <Text className="mt-2 text-3xl font-black text-[#E8EAED]">{totalWorkoutsCount}</Text>
              <Text className="mt-0.5 text-[11px] font-bold text-[#2D9CDB]">Completed sessions</Text>
            </View>

            {/* Total Volume */}
            <View className="mb-3.5 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-[#9AA0A6]">Total Volume</Text>
                <View className="rounded-xl bg-[#F2C94C]/15 p-2 border border-[#F2C94C]/25">
                  <MaterialCommunityIcons name="weight-kilogram" size={18} color="#F2C94C" />
                </View>
              </View>
              <Text className="mt-2 text-3xl font-black text-[#E8EAED]">
                {totalVolumeKg >= 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}t` : `${Math.round(totalVolumeKg)}kg`}
              </Text>
              <Text className="mt-0.5 text-[11px] font-bold text-[#F2C94C]">Weight lifted total</Text>
            </View>

            {/* Active Time */}
            <View className="mb-3.5 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-[#9AA0A6]">Active Time</Text>
                <View className="rounded-xl bg-[#2D9CDB]/15 p-2 border border-[#2D9CDB]/20">
                  <Ionicons name="timer-outline" size={18} color="#2D9CDB" />
                </View>
              </View>
              <Text className="mt-2 text-3xl font-black text-[#E8EAED]">{formatSeconds(totalTimeSec)}</Text>
              <Text className="mt-0.5 text-[11px] font-bold text-[#2D9CDB]">Time in gym</Text>
            </View>

            {/* Streak */}
            <View className="mb-3.5 w-[48%] rounded-3xl border border-[#2D333B] bg-[#1F2328] p-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-extrabold text-[#9AA0A6]">Streak</Text>
                <View className="rounded-xl bg-[#F2C94C]/15 p-2 border border-[#F2C94C]/25">
                  <Ionicons name="flame" size={18} color="#F2C94C" />
                </View>
              </View>
              <Text className="mt-2 text-3xl font-black text-[#E8EAED]">
                {analytics?.streak || (totalWorkoutsCount > 0 ? 1 : 0)} <Text className="text-base font-bold">Days</Text>
              </Text>
              <Text className="mt-0.5 text-[11px] font-bold text-[#F2C94C]">Consistency 🔥</Text>
            </View>
          </View>

          {/* MAIN VOLUME PROGRESSION GRAPH CARD */}
          <View className="mt-1 rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-md">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-lg font-black text-[#E8EAED]">Volume Lifted Trend</Text>
                <Text className="text-xs font-bold text-[#9AA0A6]">Cumulative kg per workout session</Text>
              </View>
              <View className="flex-row items-center rounded-xl bg-[#2D9CDB]/15 px-3 py-1 border border-[#2D9CDB]/25">
                <Ionicons name="trending-up" size={15} color="#2D9CDB" />
                <Text className="ml-1 text-xs font-black text-[#2D9CDB]">kg Volume</Text>
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
                backgroundGradientFrom: '#1F2328',
                backgroundGradientTo: '#1F2328',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(45, 156, 219, ${opacity})`,
                labelColor: () => '#9AA0A6',
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2.5',
                  stroke: '#2D9CDB',
                  fill: '#121417',
                },
              }}
              bezier
              style={{
                borderRadius: 16,
                marginVertical: 8,
              }}
            />
          </View>

          {/* PR HALL OF FAME / TOP RECORDS */}
          {prHallOfFame.length > 0 && (
            <View className="mt-5 rounded-3xl border border-[#F2C94C]/25 bg-[#1F2328] p-5 shadow-xs">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="rounded-xl bg-[#F2C94C]/20 p-2 mr-2.5 border border-[#F2C94C]/30">
                    <Ionicons name="trophy" size={20} color="#F2C94C" />
                  </View>
                  <View>
                    <Text className="text-base font-black text-[#E8EAED]">Personal Records (PRs)</Text>
                    <Text className="text-xs font-bold text-[#F2C94C]">Your heaviest peak lifts logged</Text>
                  </View>
                </View>
              </View>

              <View className="space-y-2">
                {prHallOfFame.map((pr, idx) => (
                  <View
                    key={idx}
                    className="flex-row items-center justify-between rounded-2xl bg-[#16191E] p-3 border border-[#2D333B] shadow-xs mb-2">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-black text-[#F2C94C] mr-2.5">#{idx + 1}</Text>
                      <View>
                        <Text className="text-sm font-black text-[#E8EAED]">{pr.exerciseName}</Text>
                        <Text className="text-[11px] font-bold text-[#9AA0A6]">
                          {pr.bodyPart} • Best: {pr.maxWeight}kg × {pr.reps} reps
                        </Text>
                      </View>
                    </View>
                    <View className="rounded-xl bg-[#F2C94C]/15 px-3 py-1.5 border border-[#F2C94C]/25">
                      <Text className="text-xs font-black text-[#F2C94C]">{pr.maxWeight} kg</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* MUSCLE GROUP DISTRIBUTION */}
          {Object.keys(muscleDist).length > 0 && (
            <View className="mt-5 rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-xs mb-8">
              <Text className="text-base font-black text-[#E8EAED]">Muscle Group Focus</Text>
              <Text className="text-xs font-bold text-[#9AA0A6] mb-3.5">Distribution of completed sets</Text>

              {Object.entries(muscleDist).map(([muscle, count]) => {
                const totalSets = Object.values(muscleDist).reduce((a, b) => a + b, 0);
                const percent = Math.round((count / (totalSets || 1)) * 100);

                return (
                  <View key={muscle} className="mb-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xs font-extrabold text-[#E8EAED]">{muscle}</Text>
                      <Text className="text-xs font-black text-[#2D9CDB]">
                        {count} sets ({percent}%)
                      </Text>
                    </View>
                    <View className="h-2.5 w-full rounded-full bg-[#16191E] overflow-hidden border border-[#2D333B]">
                      <View
                        className="h-full rounded-full bg-[#2D9CDB]"
                        style={{ width: `${percent}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* TAB 2: EXERCISE-SPECIFIC PROGRESS */}
      {activeTab === 'exercise' && (
        <View className="mt-4 mb-10">
          <Text className="text-base font-black text-[#E8EAED] mb-1">Select Exercise to Analyze</Text>
          <Text className="text-xs font-bold text-[#9AA0A6] mb-3">
            Track individual exercise progression, 1RM estimates & historical sets
          </Text>

          {/* SEARCH & HORIZONTAL EXERCISE SELECTOR CHIPS */}
          <View className="mb-3 rounded-2xl bg-[#1F2328] p-2.5 border border-[#2D333B] flex-row items-center">
            <Ionicons name="search" size={18} color="#2D9CDB" style={{ marginRight: 8 }} />
            <TextInput
              value={exerciseSearch}
              onChangeText={setExerciseSearch}
              placeholder="Search exercise (e.g., Bench Press, Squat)..."
              placeholderTextColor="#9AA0A6"
              className="flex-1 text-xs font-bold text-[#E8EAED]"
            />
            {exerciseSearch.length > 0 && (
              <TouchableOpacity onPress={() => setExerciseSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9AA0A6" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
            {filteredExerciseList.map((exName) => (
              <TouchableOpacity
                key={exName}
                onPress={() => setSelectedExercise(exName)}
                className={`mr-2 rounded-xl border px-3.5 py-2 ${
                  selectedExercise?.toLowerCase() === exName.toLowerCase()
                    ? 'border-[#2D9CDB] bg-[#2D9CDB]'
                    : 'border-[#2D333B] bg-[#1F2328] shadow-xs'
                }`}>
                <Text
                  className={`text-xs font-extrabold ${
                    selectedExercise?.toLowerCase() === exName.toLowerCase()
                      ? 'text-[#121417]'
                      : 'text-[#9AA0A6]'
                  }`}>
                  {exName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* SELECTED EXERCISE DETAILED PROGRESS CARD */}
          {exerciseProgressData ? (
            <View>
              {/* EXERCISE TITLE HEADER */}
              <View className="rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-md mb-4">
                <View className="flex-row items-center justify-between pb-3 border-b border-[#2D333B]">
                  <View className="flex-1">
                    <Text className="text-xl font-black text-[#E8EAED]">{exerciseProgressData.name}</Text>
                    <Text className="text-xs font-bold text-[#2D9CDB] mt-0.5">
                      Target Body Part: {exerciseProgressData.logs[0]?.bodyPart || 'General'}
                    </Text>
                  </View>
                  <View className="rounded-2xl bg-[#2D9CDB]/15 px-3 py-1.5 border border-[#2D9CDB]/25">
                    <Text className="text-xs font-black text-[#2D9CDB]">
                      {exerciseProgressData.growthPercent >= 0 ? `+${exerciseProgressData.growthPercent}%` : `${exerciseProgressData.growthPercent}%`} Strength
                    </Text>
                  </View>
                </View>

                {/* EXERCISE METRIC BADGES */}
                <View className="mt-4 flex-row flex-wrap justify-between">
                  {/* Max Weight Ever */}
                  <View className="mb-3 w-[48%] rounded-2xl bg-[#16191E] p-3.5 border border-[#2D333B]">
                    <Text className="text-[11px] font-extrabold text-[#9AA0A6]">Peak Weight Lifted</Text>
                    <Text className="mt-1 text-2xl font-black text-[#E8EAED]">
                      {exerciseProgressData.maxWeightEver} <Text className="text-xs font-bold">kg</Text>
                    </Text>
                    <Text className="text-[10px] font-bold text-[#2D9CDB] mt-0.5">Personal Record (PR)</Text>
                  </View>

                  {/* Estimated 1RM */}
                  <View className="mb-3 w-[48%] rounded-2xl bg-[#16191E] p-3.5 border border-[#2D333B]">
                    <Text className="text-[11px] font-extrabold text-[#9AA0A6]">Est. 1RM (One Rep Max)</Text>
                    <Text className="mt-1 text-2xl font-black text-[#E8EAED]">
                      {exerciseProgressData.max1RMEver} <Text className="text-xs font-bold">kg</Text>
                    </Text>
                    <Text className="text-[10px] font-bold text-[#2D9CDB] mt-0.5">Calculated Max Strength</Text>
                  </View>

                  {/* Total Sets */}
                  <View className="w-[48%] rounded-2xl bg-[#16191E] p-3.5 border border-[#2D333B]">
                    <Text className="text-[11px] font-extrabold text-[#9AA0A6]">Total Sets Done</Text>
                    <Text className="mt-1 text-2xl font-black text-[#E8EAED]">
                      {exerciseProgressData.totalExerciseSets} <Text className="text-xs font-bold">sets</Text>
                    </Text>
                    <Text className="text-[10px] font-bold text-[#2D9CDB] mt-0.5">Completed in history</Text>
                  </View>

                  {/* Total Sessions */}
                  <View className="w-[48%] rounded-2xl bg-[#16191E] p-3.5 border border-[#2D333B]">
                    <Text className="text-[11px] font-extrabold text-[#9AA0A6]">Logged Sessions</Text>
                    <Text className="mt-1 text-2xl font-black text-[#E8EAED]">
                      {exerciseProgressData.logs.length} <Text className="text-xs font-bold">workouts</Text>
                    </Text>
                    <Text className="text-[10px] font-bold text-[#2D9CDB] mt-0.5">Occurrences</Text>
                  </View>
                </View>
              </View>

              {/* EXERCISE PROGRESSION LINE CHART */}
              <View className="rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-md mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-black text-[#E8EAED]">Peak Weight Progression Graph</Text>
                  <View className="rounded-lg bg-[#2D9CDB]/15 px-2.5 py-1">
                    <Text className="text-[10px] font-black text-[#2D9CDB]">kg Lifted</Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-[#9AA0A6] mb-3">
                  Max weight lifted per session over time
                </Text>

                <LineChart
                  data={{
                    labels: exerciseProgressData.chartLabels,
                    datasets: [{ data: exerciseProgressData.chartPoints }],
                  }}
                  width={screenWidth - 64}
                  height={190}
                  yAxisSuffix="kg"
                  chartConfig={{
                    backgroundGradientFrom: '#1F2328',
                    backgroundGradientTo: '#1F2328',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(45, 156, 219, ${opacity})`,
                    labelColor: () => '#9AA0A6',
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#2D9CDB',
                      fill: '#121417',
                    },
                  }}
                  bezier
                  style={{ borderRadius: 16, marginVertical: 4 }}
                />
              </View>

              {/* EXERCISE HISTORY LOG TABLE */}
              <View className="rounded-3xl border border-[#2D333B] bg-[#1F2328] p-5 shadow-sm">
                <Text className="text-base font-black text-[#E8EAED] mb-3">
                  {selectedExercise} History Log
                </Text>

                {exerciseProgressData.logs.map((logItem, logIdx) => (
                  <View
                    key={logIdx}
                    className="mb-3 rounded-2xl border border-[#2D333B] bg-[#16191E] p-3.5">
                    <View className="flex-row items-center justify-between pb-2 border-b border-[#2D333B]">
                      <View>
                        <Text className="text-xs font-black text-[#E8EAED]">{logItem.workoutTitle}</Text>
                        <Text className="text-[10px] font-bold text-[#9AA0A6]">{formatDate(logItem.date)}</Text>
                      </View>
                      <View className="rounded-xl bg-[#2D9CDB] px-2.5 py-1">
                        <Text className="text-[10px] font-black text-[#121417]">Max: {logItem.maxWeight}kg</Text>
                      </View>
                    </View>

                    <View className="mt-2.5 flex-row flex-wrap gap-1.5">
                      {logItem.sets.map((s, sIdx) => (
                        <View
                          key={sIdx}
                          className="rounded-xl border border-[#2D333B] bg-[#1F2328] px-2.5 py-1 flex-row items-center shadow-xs">
                          <Text className="text-[10px] font-bold text-[#2D9CDB] mr-1">
                            Set {sIdx + 1}:
                          </Text>
                          <Text className="text-[11px] font-extrabold text-[#E8EAED]">
                            {s.weight || 0}kg × {s.reps || 0} reps
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View className="rounded-3xl border border-dashed border-[#2D333B] bg-[#1F2328] p-8 items-center mt-2 shadow-xs">
              <MaterialCommunityIcons name="dumbbell" size={40} color="#2D9CDB" />
              <Text className="text-base font-black text-[#E8EAED] mt-3">No Exercise Logs Found</Text>
              <Text className="text-xs text-[#9AA0A6] text-center mt-1">
                Select an exercise from the list above or log a workout session containing this exercise to view full analytics!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* TAB 3: WORKOUT HISTORY LOG */}
      {activeTab === 'history' && (
        <View className="mt-4 mb-10">
          {/* FILTER CHIPS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
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
                    ? 'border-[#2D9CDB] bg-[#2D9CDB]'
                    : 'border-[#2D333B] bg-[#1F2328] shadow-xs'
                }`}>
                <Text
                  className={`text-xs font-extrabold ${
                    activeFilter === chip.key ? 'text-[#121417]' : 'text-[#9AA0A6]'
                  }`}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* HISTORY FEED LIST */}
          {filteredHistoryFeed.length === 0 ? (
            <View className="rounded-3xl border border-dashed border-[#2D333B] bg-[#1F2328] p-8 items-center shadow-xs">
              <MaterialCommunityIcons name="clipboard-text-outline" size={44} color="#2D9CDB" />
              <Text className="text-base font-black text-[#E8EAED] mt-2">No History Log Found</Text>
              <Text className="text-xs text-[#9AA0A6] text-center mt-1 mb-4">
                Complete a workout session to log exercise sets, reps, duration, and progressive volume!
              </Text>
            </View>
          ) : (
            filteredHistoryFeed.map((workout, idx) => {
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
                  className="mb-4 overflow-hidden rounded-3xl border border-[#2D333B] bg-[#1F2328] shadow-sm">
                  {/* MAIN CARD ACCORDION BAR */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleExpand(workoutId)}
                    className="p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="rounded-2xl bg-[#2D9CDB]/15 p-3 border border-[#2D9CDB]/25 mr-3">
                        <MaterialCommunityIcons name="arm-flex" size={22} color="#2D9CDB" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-black text-[#E8EAED]" numberOfLines={1}>
                          {workout.title || workout.name || 'Workout Session'}
                        </Text>
                        <Text className="text-xs font-medium text-[#9AA0A6] mt-0.5">
                          {formatDate(workout.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <View className="rounded-full bg-[#16191E] px-2.5 py-1 border border-[#2D333B] flex-row items-center mb-1">
                        <Ionicons name="timer-outline" size={13} color="#2D9CDB" style={{ marginRight: 3 }} />
                        <Text className="text-[11px] font-extrabold text-[#2D9CDB]">
                          {formatSeconds(workout.duration)}
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#9AA0A6"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* QUICK STATS SUB-BAR */}
                  <View className="px-4 pb-3 flex-row items-center justify-between border-b border-[#2D333B]">
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-xs font-bold text-[#E8EAED]">
                        📊 {exercisesList.length} Exercise{exercisesList.length !== 1 ? 's' : ''}
                      </Text>
                      <Text className="text-xs text-[#9AA0A6]">•</Text>
                      <Text className="text-xs font-bold text-[#E8EAED]">
                        {totalSetsCount} Set{totalSetsCount !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    <Text className="text-xs font-extrabold text-[#2D9CDB]">
                      {Math.round(workoutVol)} kg Volume
                    </Text>
                  </View>

                  {/* EXPANDABLE EXERCISE SET BREAKDOWN */}
                  {isExpanded && (
                    <View className="bg-[#16191E] p-4 border-t border-[#2D333B]">
                      <Text className="text-[11px] font-extrabold text-[#9AA0A6] uppercase tracking-wider mb-2.5">
                        Exercise Details Breakdown
                      </Text>

                      {exercisesList.map((ex, exIdx) => {
                        const completedSets = (ex.sets || []).filter(
                          (s) => s.completed || s.completed === undefined
                        );

                        return (
                          <View
                            key={ex.exerciseId || exIdx}
                            className="mb-3 rounded-2xl border border-[#2D333B] bg-[#1F2328] p-3">
                            <View className="flex-row items-center justify-between pb-2 border-b border-[#2D333B]">
                              <Text className="text-xs font-extrabold text-[#E8EAED]">
                                {exIdx + 1}. {ex.name}
                              </Text>
                              <View className="rounded-md bg-[#2D9CDB]/15 px-2 py-0.5">
                                <Text className="text-[10px] font-bold text-[#2D9CDB] uppercase">
                                  {ex.bodyPart || 'General'}
                                </Text>
                              </View>
                            </View>

                            <View className="mt-2 flex-row flex-wrap gap-1.5">
                              {completedSets.length === 0 ? (
                                <Text className="text-[11px] text-[#9AA0A6] italic">No sets recorded.</Text>
                              ) : (
                                completedSets.map((s, sIdx) => (
                                  <View
                                    key={sIdx}
                                    className="rounded-xl border border-[#2D333B] bg-[#16191E] px-2.5 py-1 flex-row items-center">
                                    <Text className="text-[10px] font-bold text-[#2D9CDB] mr-1">
                                      S{sIdx + 1}:
                                    </Text>
                                    <Text className="text-[11px] font-extrabold text-[#E8EAED]">
                                      {s.weight || 0}kg × {s.reps || 0}
                                    </Text>
                                  </View>
                                ))
                              )}
                            </View>
                          </View>
                        );
                      })}

                      {/* DELETE ENTRY BUTTON */}
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
        </View>
      )}

      <View className="h-32" />
    </ScrollView>
  );
}
