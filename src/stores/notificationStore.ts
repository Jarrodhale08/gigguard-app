import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notification.service';

interface NotificationSettings {
  // Master toggle
  pushEnabled: boolean;

  // Notification types
  dailyReminders: boolean;
  weeklyReport: boolean;
  taxDeadlines: boolean;
  invoiceReminders: boolean;
  achievements: boolean;
  marketing: boolean;

  // Daily reminder settings
  reminderTime: {
    hour: number;
    minute: number;
  };
  reminderDays: number[]; // 0=Sunday, 1=Monday, etc.

  // Push token
  expoPushToken: string | null;
}

interface NotificationState extends NotificationSettings {
  // State
  isLoading: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';

  // Actions
  requestPermissions: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  setReminderTime: (hour: number, minute: number) => Promise<void>;
  setReminderDays: (days: number[]) => Promise<void>;
  toggleNotificationType: (type: keyof Pick<NotificationSettings, 'dailyReminders' | 'weeklyReport' | 'taxDeadlines' | 'invoiceReminders' | 'achievements' | 'marketing'>) => Promise<void>;
  syncNotifications: () => Promise<void>;
  setPushToken: (token: string | null) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  dailyReminders: true,
  weeklyReport: true,
  taxDeadlines: true,
  invoiceReminders: true,
  achievements: true,
  marketing: false,
  reminderTime: {
    hour: 9,
    minute: 0,
  },
  reminderDays: [1, 2, 3, 4, 5], // Monday-Friday
  expoPushToken: null,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isLoading: false,
      permissionStatus: 'undetermined',

      requestPermissions: async () => {
        set({ isLoading: true });
        try {
          const token = await notificationService.initializeNotifications();

          if (token) {
            set({
              permissionStatus: 'granted',
              expoPushToken: token,
              pushEnabled: true,
            });
            return true;
          } else {
            set({
              permissionStatus: 'denied',
              pushEnabled: false,
            });
            return false;
          }
        } catch (error) {
          console.error('Failed to request permissions:', error);
          set({ permissionStatus: 'denied' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (settings) => {
        set(settings);
        await get().syncNotifications();
      },

      setReminderTime: async (hour, minute) => {
        set({
          reminderTime: { hour, minute },
        });
        await get().syncNotifications();
      },

      setReminderDays: async (days) => {
        set({ reminderDays: days });
        await get().syncNotifications();
      },

      toggleNotificationType: async (type) => {
        const currentValue = get()[type];
        set({ [type]: !currentValue });
        await get().syncNotifications();
      },

      syncNotifications: async () => {
        const state = get();

        if (!state.pushEnabled) {
          // Disable all notifications
          await notificationService.cancelAllNotifications();
          return;
        }

        try {
          // Schedule daily reminders
          if (state.dailyReminders) {
            const { hour, minute } = state.reminderTime;
            await notificationService.scheduleDailyReminder(
              hour,
              minute,
              'Daily Gig Check-in',
              'Track your income and expenses for today'
            );
          }

          // Schedule weekly report (Monday at 9 AM)
          if (state.weeklyReport) {
            await notificationService.scheduleWeeklyReminder(
              2, // Monday
              9,
              0,
              'Weekly Financial Summary',
              'Check your earnings and expenses from last week'
            );
          }

          // Tax deadline reminders are scheduled when quarters are set up
          // Invoice reminders are scheduled when invoices are created

        } catch (error) {
          console.error('Failed to sync notifications:', error);
        }
      },

      setPushToken: (token) => {
        set({ expoPushToken: token });
      },
    }),
    {
      name: 'gigguard-notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pushEnabled: state.pushEnabled,
        dailyReminders: state.dailyReminders,
        weeklyReport: state.weeklyReport,
        taxDeadlines: state.taxDeadlines,
        invoiceReminders: state.invoiceReminders,
        achievements: state.achievements,
        marketing: state.marketing,
        reminderTime: state.reminderTime,
        reminderDays: state.reminderDays,
        expoPushToken: state.expoPushToken,
      }),
    }
  )
);
