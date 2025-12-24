import { create } from 'zustand';
import Purchases from 'react-native-purchases';
import * as SecureStore from 'expo-secure-store';
import { ENTITLEMENT_ID, TRIAL_DAYS } from '../services/revenueCat.service';
import RevenueCatService from '../services/revenueCat.service';

interface SubscriptionState {
  // Premium status
  isPremium: boolean;
  isLoading: boolean;

  // Subscription details
  currentPlan: 'free' | 'monthly' | 'yearly' | 'lifetime' | null;
  expirationDate: Date | null;
  willRenew: boolean;

  // Trial state
  isTrialEligible: boolean;
  trialDays: number;
  isInTrial: boolean;
  trialEndDate: Date | null;

  // Actions
  checkPremiumStatus: () => Promise<void>;
  checkTrialEligibility: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  setPremium: (isPremium: boolean) => void;
}

// Get stored premium status from secure storage
async function getStoredPremiumStatus(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync('gigguard_premium_status');
    return stored === 'true';
  } catch {
    return false;
  }
}

// Store premium status in secure storage
async function storePremiumStatus(isPremium: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync('gigguard_premium_status', isPremium ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to store premium status:', error);
  }
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => {
  // Initialize with stored value
  getStoredPremiumStatus().then(stored => {
    set({ isPremium: stored });
  });

  // Set up customer info listener
  Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    // Determine current plan
    let currentPlan: 'free' | 'monthly' | 'yearly' | 'lifetime' | null = 'free';
    let expirationDate: Date | null = null;
    let willRenew = false;
    let isInTrial = false;
    let trialEndDate: Date | null = null;

    if (hasEntitlement && entitlement) {
      // Check if in trial period
      if (entitlement.periodType === 'TRIAL') {
        isInTrial = true;
        if (entitlement.expirationDate) {
          trialEndDate = new Date(entitlement.expirationDate);
        }
      }

      // Set expiration date
      if (entitlement.expirationDate) {
        expirationDate = new Date(entitlement.expirationDate);
      }

      // Check if will renew
      willRenew = entitlement.willRenew;

      // Determine plan type from product identifier
      const productId = entitlement.productIdentifier.toLowerCase();
      if (productId.includes('lifetime')) {
        currentPlan = 'lifetime';
      } else if (productId.includes('annual') || productId.includes('yearly') || productId.includes('year')) {
        currentPlan = 'yearly';
      } else if (productId.includes('monthly') || productId.includes('month')) {
        currentPlan = 'monthly';
      }
    }

    set({
      isPremium: hasEntitlement,
      currentPlan,
      expirationDate,
      willRenew,
      isInTrial,
      trialEndDate,
    });

    // Store in secure storage
    storePremiumStatus(hasEntitlement);
  });

  return {
    isPremium: false,
    isLoading: false,
    currentPlan: null,
    expirationDate: null,
    willRenew: false,
    isTrialEligible: false,
    trialDays: TRIAL_DAYS,
    isInTrial: false,
    trialEndDate: null,

    checkPremiumStatus: async () => {
      set({ isLoading: true });
      try {
        const isPremium = await RevenueCatService.checkPremiumStatus();
        const customerInfo = await RevenueCatService.getCustomerInfo();

        if (customerInfo) {
          const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

          let currentPlan: 'free' | 'monthly' | 'yearly' | 'lifetime' | null = isPremium ? 'monthly' : 'free';
          let expirationDate: Date | null = null;
          let willRenew = false;
          let isInTrial = false;
          let trialEndDate: Date | null = null;

          if (entitlement) {
            // Check trial status
            if (entitlement.periodType === 'TRIAL') {
              isInTrial = true;
              if (entitlement.expirationDate) {
                trialEndDate = new Date(entitlement.expirationDate);
              }
            }

            // Set expiration
            if (entitlement.expirationDate) {
              expirationDate = new Date(entitlement.expirationDate);
            }

            willRenew = entitlement.willRenew;

            // Determine plan
            const productId = entitlement.productIdentifier.toLowerCase();
            if (productId.includes('lifetime')) {
              currentPlan = 'lifetime';
            } else if (productId.includes('annual') || productId.includes('yearly') || productId.includes('year')) {
              currentPlan = 'yearly';
            } else if (productId.includes('monthly') || productId.includes('month')) {
              currentPlan = 'monthly';
            }
          }

          set({
            isPremium,
            currentPlan,
            expirationDate,
            willRenew,
            isInTrial,
            trialEndDate,
          });

          await storePremiumStatus(isPremium);
        } else {
          set({ isPremium });
          await storePremiumStatus(isPremium);
        }
      } catch (error) {
        console.error('Failed to check premium status:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    checkTrialEligibility: async () => {
      try {
        const { isEligible, trialDays } = await RevenueCatService.checkTrialEligibility();
        set({
          isTrialEligible: isEligible,
          trialDays: trialDays || TRIAL_DAYS,
        });
      } catch (error) {
        console.error('Failed to check trial eligibility:', error);
      }
    },

    refreshStatus: async () => {
      await get().checkPremiumStatus();
      await get().checkTrialEligibility();
    },

    setPremium: (isPremium: boolean) => {
      set({ isPremium });
      storePremiumStatus(isPremium);
    },
  };
});
