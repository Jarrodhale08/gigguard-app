/**
 * Premium Features Configuration for GigGuard
 *
 * Defines free tier limits and premium feature gates for freelancer finance management.
 */

export const FREE_TIER_LIMITS = {
  // Gig & Income Tracking
  maxGigs: 25,                    // Free users can track up to 25 gigs
  maxIncomeSources: 3,            // Free users can connect 3 income sources (Uber, DoorDash, etc.)
  maxClients: 10,                 // Free users can manage up to 10 clients

  // Expense Tracking
  maxExpenses: 50,                // Free users can log 50 expenses per month
  maxCategories: 5,               // Free users can create 5 custom categories
  receiptScanning: false,         // Receipt OCR scanning is premium

  // Tax Features
  quarterlyTaxEstimates: false,   // Quarterly tax estimates are premium
  taxDeductionSuggestions: false, // AI-powered deduction suggestions are premium
  taxReportExport: false,         // Exportable tax reports are premium

  // Invoicing
  maxInvoicesPerMonth: 5,         // Free users can send 5 invoices per month
  customBranding: false,          // Custom invoice branding is premium
  recurringInvoices: false,       // Recurring invoices are premium
  paymentReminders: false,        // Automatic payment reminders are premium

  // Reports & Analytics
  basicReports: true,             // Basic spending charts available
  advancedAnalytics: false,       // Detailed analytics and trends are premium
  incomeProjections: false,       // Future income projections are premium
  profitMarginAnalysis: false,    // Profit margin analysis is premium

  // Savings & Goals
  maxSavingsGoals: 2,             // Free users can set 2 savings goals
  autoSavingsRules: false,        // Automatic savings rules are premium

  // Sync & Backup
  cloudSync: false,               // Cloud sync across devices is premium
  dataExport: false,              // CSV/PDF export is premium
  bankSync: false,                // Bank account sync is premium
};

export const PREMIUM_FEATURES = [
  {
    id: 'unlimited_gigs',
    name: 'Unlimited Gig Tracking',
    description: 'Track unlimited gigs and income sources across all your platforms',
    icon: 'briefcase',
  },
  {
    id: 'tax_tools',
    name: 'Smart Tax Tools',
    description: 'Quarterly tax estimates, deduction suggestions, and exportable tax reports',
    icon: 'calculator',
  },
  {
    id: 'unlimited_invoicing',
    name: 'Unlimited Invoicing',
    description: 'Send unlimited invoices with custom branding and recurring billing',
    icon: 'document-text',
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed reports, income projections, and profit margin analysis',
    icon: 'stats-chart',
  },
  {
    id: 'receipt_scanning',
    name: 'Receipt Scanning',
    description: 'Scan receipts with OCR to automatically log expenses',
    icon: 'camera',
  },
  {
    id: 'cloud_sync',
    name: 'Cloud Sync & Backup',
    description: 'Sync data across all your devices and never lose your records',
    icon: 'cloud-upload',
  },
  {
    id: 'bank_sync',
    name: 'Bank Account Sync',
    description: 'Automatically import transactions from your bank accounts',
    icon: 'card',
  },
  {
    id: 'auto_savings',
    name: 'Automatic Savings',
    description: 'Set rules to automatically set aside money for taxes and goals',
    icon: 'wallet',
  },
];

export const ENTITLEMENT_ID = 'gigguard_pro';

export const TRIAL_DAYS = 7;

/**
 * Check if a feature is available for the current user
 */
export function isFeatureAvailable(
  featureKey: keyof typeof FREE_TIER_LIMITS,
  isPremium: boolean
): boolean {
  if (isPremium) return true;

  const limit = FREE_TIER_LIMITS[featureKey];
  return typeof limit === 'boolean' ? limit : true;
}

/**
 * Get the limit for a feature
 */
export function getFeatureLimit(
  featureKey: keyof typeof FREE_TIER_LIMITS,
  isPremium: boolean
): number | boolean {
  if (isPremium) return Infinity;
  return FREE_TIER_LIMITS[featureKey];
}

/**
 * Check if user has reached their limit for a countable feature
 */
export function hasReachedLimit(
  featureKey: keyof typeof FREE_TIER_LIMITS,
  currentCount: number,
  isPremium: boolean
): boolean {
  if (isPremium) return false;

  const limit = FREE_TIER_LIMITS[featureKey];
  if (typeof limit !== 'number') return false;

  return currentCount >= limit;
}
