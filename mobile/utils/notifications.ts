import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Only handle notifications if we are NOT running in standard Expo Go app
if (Constants.appOwnership !== 'expo') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync() {
  if (Constants.appOwnership === 'expo') {
    console.log("Push notifications disabled in Expo Go. Use a development build.");
    return;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#29a38b',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleDailyStudyReminder(hour: number, minute: number) {
  if (Constants.appOwnership === 'expo') {
    console.log("Cannot schedule notifications in Expo Go. Use a development build.");
    return;
  }

  // Cancel any previously scheduled study reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 It's Study Time!",
      body: "Your daily scheduled study session has begun. Open PrepGenx to start your lesson!",
      data: { url: '/(tabs)/' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hour,
      minute: minute,
      repeats: true,
    },
  });
  
  console.log(`Successfully scheduled daily study reminder for ${hour}:${minute < 10 ? '0' + minute : minute}`);
}
