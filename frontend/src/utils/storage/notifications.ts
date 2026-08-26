import { Platform } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('step-updates', {
        name: 'Step & Calorie Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF7A00',
      });
    }

    return true;
  } catch (e) {
    console.warn('[Notification] Permission error:', e);
    return false;
  }
}

export async function scheduleStepNotification(steps: number, calories: number) {
  if (Platform.OS === 'web') return;
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();

    // 1. Morning Notification: 48 Hours later at 8:00 AM
    const morningDate = new Date();
    morningDate.setDate(now.getDate() + 2);
    morningDate.setHours(8, 0, 0, 0);
    const morningSeconds = Math.max(60, Math.floor((morningDate.getTime() - now.getTime()) / 1000));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Morning Activity Check!',
        body: `You are at ${steps.toLocaleString()} steps and burned ${calories.toFixed(0)} kcal. Keep moving today!`,
        sound: true,
      },
      trigger: {
        seconds: morningSeconds,
        repeats: false,
      } as any,
    });

    // 2. Night Notification: 48 Hours later at 9:00 PM (21:00)
    const nightDate = new Date();
    nightDate.setDate(now.getDate() + 2);
    nightDate.setHours(21, 0, 0, 0);
    const nightSeconds = Math.max(60, Math.floor((nightDate.getTime() - now.getTime()) / 1000));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Night Step Summary',
        body: `Activity summary: ${steps.toLocaleString()} steps | ${calories.toFixed(0)} kcal burned. Good job!`,
        sound: true,
      },
      trigger: {
        seconds: nightSeconds,
        repeats: false,
      } as any,
    });
  } catch (e) {
    console.warn('[Notification] Schedule error:', e);
  }
}
