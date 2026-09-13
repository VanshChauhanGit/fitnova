import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants?.appOwnership === 'expo' || Constants?.executionEnvironment === 'storeClient';

// Configure how notifications appear when app is in foreground safely
try {
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('Notification handler config ignored:', e?.message);
}

/**
 * Request user permission for local push notifications
 */
export async function requestNotificationPermissions() {
  try {
    if (Platform.OS === 'web') {
      return { granted: false, message: 'Notifications not supported on Web' };
    }

    if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') {
      return { granted: false, message: 'Notifications API unavailable' };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { granted: false, message: 'Notification permission not granted' };
    }

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('workout-reminders', {
          name: 'Workout Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#017374',
        });
      } catch (chErr) {
        console.log('Android notification channel setup note:', chErr?.message);
      }
    }

    return { granted: true };
  } catch (error) {
    console.log('Notification permission error:', error?.message);
    return { granted: false, message: error?.message || 'Permission check failed' };
  }
}

/**
 * Schedule a daily recurring workout reminder notification
 */
export async function scheduleDailyWorkoutReminder(timeString = '18:00', workoutTitle = "Today's Workout", targetMuscles = []) {
  try {
    if (Platform.OS === 'web') {
      return { success: false, message: 'Not supported on web' };
    }

    const permission = await requestNotificationPermissions();
    if (!permission.granted) {
      return { success: false, message: permission.message || 'Notification permission denied' };
    }

    // Cancel existing scheduled notifications first
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (_) {}

    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10) || 18;
    const minute = parseInt(minuteStr, 10) || 0;

    const muscleText = targetMuscles.length > 0 ? targetMuscles.join(', ') : 'Daily Split';

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Workout Time! - FitNova',
        body: `Time for ${workoutTitle} (${muscleText}). Stay consistent & crush your goals! 💪`,
        sound: true,
        data: { screen: 'WorkoutPlans' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return { success: true, identifier };
  } catch (error) {
    console.log('Error scheduling daily workout reminder:', error?.message);
    return { success: false, message: error?.message || 'Scheduling failed' };
  }
}

/**
 * Trigger an immediate test notification to verify notifications work
 */
export async function sendInstantTestNotification(workoutTitle = "Today's Workout") {
  try {
    if (Platform.OS === 'web') {
      return { success: false, message: 'Not supported on web' };
    }

    const permission = await requestNotificationPermissions();
    if (!permission.granted) {
      return { success: false, message: permission.message || 'Notification permission denied' };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ FitNova Workout Reminder Test',
        body: `Your daily reminder is set! Scheduled workout: ${workoutTitle}. Let's get to work! 💪`,
        sound: true,
      },
      trigger: null, // trigger immediately
    });

    return { success: true };
  } catch (error) {
    console.log('Error sending instant test notification:', error?.message);
    return { success: false, message: error?.message || 'Test notification failed' };
  }
}

/**
 * Cancel all scheduled workout reminders
 */
export async function cancelAllWorkoutReminders() {
  try {
    if (Platform.OS === 'web' || !Notifications) return { success: true };
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.log('Error cancelling workout reminders:', error?.message);
    return { success: false, message: error?.message };
  }
}
