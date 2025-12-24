import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
export const ENTITLEMENT_ID = 'gigguard_pro';
export const TRIAL_DAYS = 7;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(): Promise<void> {
  if (!REVENUECAT_API_KEY) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    }

    // Enable debug logs in development
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Check if user has active premium subscription
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return hasEntitlement;
  } catch (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }
}

/**
 * Get available offerings (subscription packages)
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: isPremium,
      customerInfo,
    };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }
    console.error('Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    return {
      success: true,
      customerInfo,
    };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Get customer info (includes subscription status, expiry dates, etc.)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if user is eligible for free trial
 */
export async function checkTrialEligibility(): Promise<{
  isEligible: boolean;
  trialDays: number;
}> {
  try {
    const offerings = await getOfferings();
    if (!offerings?.current) {
      return { isEligible: false, trialDays: 0 };
    }

    // Check if any package has a free trial intro price
    const packages = offerings.current.availablePackages;
    const hasTrialPackage = packages.some(pkg => {
      const introPrice = pkg.product.introPrice;
      return introPrice && introPrice.price === 0;
    });

    return {
      isEligible: hasTrialPackage,
      trialDays: hasTrialPackage ? TRIAL_DAYS : 0,
    };
  } catch (error) {
    console.error('Failed to check trial eligibility:', error);
    return { isEligible: false, trialDays: 0 };
  }
}

/**
 * Get trial info for a specific package
 */
export function getPackageTrialInfo(pkg: PurchasesPackage): {
  hasFreeTrial: boolean;
  trialDays: number;
  trialDescription: string;
} {
  const introPrice = pkg.product.introPrice;

  if (introPrice && introPrice.price === 0) {
    const periodUnit = introPrice.periodUnit;
    const periodNumber = introPrice.periodNumberOfUnits;

    let trialDays = 0;
    if (periodUnit === 'DAY') trialDays = periodNumber;
    else if (periodUnit === 'WEEK') trialDays = periodNumber * 7;
    else if (periodUnit === 'MONTH') trialDays = periodNumber * 30;

    return {
      hasFreeTrial: true,
      trialDays,
      trialDescription: `${periodNumber} ${periodUnit.toLowerCase()}${periodNumber > 1 ? 's' : ''} free`,
    };
  }

  return {
    hasFreeTrial: false,
    trialDays: 0,
    trialDescription: '',
  };
}

/**
 * Check if user has previously used a trial
 */
export async function hasUsedTrial(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // If user has any entitlement (active or expired), they've used a trial
    const allEntitlements = Object.keys(customerInfo.entitlements.all);
    return allEntitlements.length > 0;
  } catch (error) {
    console.error('Failed to check trial usage:', error);
    return false;
  }
}

/**
 * Set user ID for RevenueCat analytics
 */
export async function setUserId(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}

/**
 * Logout user from RevenueCat
 */
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('Failed to logout from RevenueCat:', error);
  }
}

export default {
  initializeRevenueCat,
  checkPremiumStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  checkTrialEligibility,
  getPackageTrialInfo,
  hasUsedTrial,
  setUserId,
  logoutUser,
};
