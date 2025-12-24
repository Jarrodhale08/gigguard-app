import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

/**
 * Initialize notification service
 * Call this hook in the root _layout.tsx
 */
export function useNotificationInit() {
  const { requestPermissions, syncNotifications, pushEnabled } = useNotificationStore();

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Request permissions if not already granted
        const granted = await requestPermissions();

        // Sync notification schedules if permissions granted
        if (granted && pushEnabled && mounted) {
          await syncNotifications();
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [requestPermissions, syncNotifications, pushEnabled]);
}
