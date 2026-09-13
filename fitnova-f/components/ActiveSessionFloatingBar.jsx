import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useWorkoutStore from '../store/workoutStore';

export default function ActiveSessionFloatingBar({ navigation, bottomOffset = 72 }) {
  const isSessionActive = useWorkoutStore((state) => state.isSessionActive);
  const activeSession = useWorkoutStore((state) => state.activeSession);
  const dismissRestAlarm = useWorkoutStore((state) => state.dismissRestAlarm);

  if (!isSessionActive || !activeSession) {
    return null;
  }

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const title = activeSession.sessionInfo?.dayTitle || 'Active Workout';
  const elapsed = activeSession.elapsedSeconds || 0;
  const restActive = !!activeSession.restActive;
  const restSeconds = activeSession.restSeconds || 0;
  const restAlarmActive = !!activeSession.restAlarmActive;

  const handlePress = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('WorkoutLoggingSession');
    }
  };

  return (
    <View style={{ position: 'absolute', bottom: bottomOffset, left: 16, right: 16, zIndex: 50 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className={`flex-row items-center justify-between rounded-2xl p-3.5 shadow-xl border ${
          restAlarmActive
            ? 'bg-rose-950 border-rose-500/80 shadow-rose-900/50'
            : restActive
            ? 'bg-[#014041] border-teal-400/50'
            : 'bg-[#014041] border-[#017374]/40'
        }`}>
        <View className="flex-row items-center flex-1 mr-2">
          <View className={`rounded-xl p-2 mr-3 ${restAlarmActive ? 'bg-rose-600' : 'bg-[#017374]'}`}>
            <Ionicons name={restAlarmActive ? 'alarm' : 'timer'} size={20} color="#FFFFFF" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <View className={`h-2 w-2 rounded-full mr-1.5 ${restAlarmActive ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <Text className={`text-[10px] font-extrabold uppercase tracking-wider ${restAlarmActive ? 'text-rose-300' : 'text-emerald-300'}`}>
                {restAlarmActive ? '🚨 Rest Time Over!' : restActive ? `Resting: ${formatTime(restSeconds)}` : 'Workout In Progress'}
              </Text>
            </View>
            <Text className="text-sm font-black text-white" numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {restAlarmActive ? (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                dismissRestAlarm();
              }}
              className="rounded-xl bg-rose-600 px-3 py-2 border border-white/30 flex-row items-center shadow-sm">
              <Ionicons name="notifications-off" size={14} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text className="text-xs font-black text-white uppercase">Stop Alarm</Text>
            </TouchableOpacity>
          ) : (
            <View className="rounded-xl bg-[#017374]/40 px-2.5 py-1 border border-white/10">
              <Text className="text-xs font-mono font-bold text-white">
                {formatTime(elapsed)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}


