import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Top-level configuration
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    await Notifications.setNotificationChannelAsync('step-updates', {
      name: 'Step & Calorie Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A00',
    });
    return true;
  } catch {
    return false;
  }
}

export async function scheduleStepNotification(steps: number, calories: number) {
  if (Platform.OS !== 'android') return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning Notification (48 Hours - 8:00 AM)
    const now = new Date();
    const morningDate = new Date();
    morningDate.setDate(now.getDate() + 2);
    morningDate.setHours(8, 0, 0, 0);
    const morningSec = Math.max(60, Math.floor((morningDate.getTime() - now.getTime()) / 1000));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Morning Activity Check!',
        body: `You are at ${steps.toLocaleString()} steps and burned ${Math.round(calories)} kcal. Keep moving!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: morningSec,
        repeats: false,
      },
    });

    // Night Notification (48 Hours - 9:00 PM)
    const nightDate = new Date();
    nightDate.setDate(now.getDate() + 2);
    nightDate.setHours(21, 0, 0, 0);
    const nightSec = Math.max(60, Math.floor((nightDate.getTime() - now.getTime()) / 1000));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Night Step Summary',
        body: `Activity summary: ${steps.toLocaleString()} steps | ${Math.round(calories)} kcal burned. Good job!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: nightSec,
        repeats: false,
      },
    });
  } catch {}
}
