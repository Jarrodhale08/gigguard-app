import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Android notification channels
const CHANNELS = {
  DEFAULT: 'default',
  REMINDERS: 'reminders',
  ACHIEVEMENTS: 'achievements',
  TAX_ALERTS: 'tax-alerts',
};

/**
 * Initialize notification service
 * - Requests permissions
 * - Sets up Android channels
 * - Registers for push notifications
 */
export async function initializeNotifications(): Promise<string | null> {
  try {
    // Android: Create notification channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNELS.DEFAULT, {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });

      await Notifications.setNotificationChannelAsync(CHANNELS.REMINDERS, {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync(CHANNELS.ACHIEVEMENTS, {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });

      await Notifications.setNotificationChannelAsync(CHANNELS.TAX_ALERTS, {
        name: 'Tax Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
        sound: 'default',
      });
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return null;
    }

    // Get push token for remote notifications
    if (Device.isDevice) {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } else {
      console.warn('Push notifications only work on physical devices');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return null;
  }
}

/**
 * Schedule a daily reminder notification
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  title: string,
  body: string
): Promise<string | null> {
  try {
    // Cancel existing daily reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const dailyReminders = scheduled.filter(n => n.content.data?.type === 'daily_reminder');
    for (const reminder of dailyReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }

    // Schedule new daily reminder
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule daily reminder:', error);
    return null;
  }
}

/**
 * Schedule a weekly reminder (e.g., Monday morning tax estimate)
 */
export async function scheduleWeeklyReminder(
  weekday: number, // 1=Sunday, 2=Monday, etc.
  hour: number,
  minute: number,
  title: string,
  body: string
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'weekly_reminder' },
      },
      trigger: {
        weekday,
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule weekly reminder:', error);
    return null;
  }
}

/**
 * Send immediate notification
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: data || {},
      },
      trigger: null, // Immediate
    });

    return id;
  } catch (error) {
    console.error('Failed to send immediate notification:', error);
    return null;
  }
}

/**
 * Schedule tax deadline reminder
 */
export async function scheduleTaxDeadlineReminder(
  deadlineDate: Date,
  quarterName: string
): Promise<string | null> {
  try {
    // Schedule 7 days before deadline
    const reminderDate = new Date(deadlineDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Tax Deadline',
        body: `${quarterName} quarterly taxes due in 7 days`,
        sound: 'default',
        data: { type: 'tax_deadline', quarter: quarterName },
      },
      trigger: {
        date: reminderDate,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule tax reminder:', error);
    return null;
  }
}

/**
 * Schedule invoice payment reminder
 */
export async function scheduleInvoiceReminder(
  invoiceId: string,
  clientName: string,
  dueDate: Date
): Promise<string | null> {
  try {
    // Schedule 3 days before due date
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Invoice Payment Reminder',
        body: `Invoice for ${clientName} due in 3 days`,
        sound: 'default',
        data: { type: 'invoice_reminder', invoiceId },
      },
      trigger: {
        date: reminderDate,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule invoice reminder:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

export default {
  initializeNotifications,
  scheduleDailyReminder,
  scheduleWeeklyReminder,
  sendImmediateNotification,
  scheduleTaxDeadlineReminder,
  scheduleInvoiceReminder,
  cancelAllNotifications,
  cancelNotification,
  getScheduledNotifications,
};
