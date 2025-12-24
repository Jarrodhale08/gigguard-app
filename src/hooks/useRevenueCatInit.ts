import { useEffect } from 'react';
import RevenueCatService from '../services/revenueCat.service';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { getCurrentUserId } from '../services/supabase';

/**
 * Initialize RevenueCat SDK and sync premium status
 * Call this hook in the root _layout.tsx
 */
export function useRevenueCatInit() {
  const { checkPremiumStatus, checkTrialEligibility } = useSubscriptionStore();

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Initialize RevenueCat
        await RevenueCatService.initializeRevenueCat();

        // Set user ID if authenticated
        const userId = await getCurrentUserId();
        if (userId) {
          await RevenueCatService.setUserId(userId);
        }

        // Check premium status and trial eligibility
        if (mounted) {
          await checkPremiumStatus();
          await checkTrialEligibility();
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [checkPremiumStatus, checkTrialEligibility]);
}
