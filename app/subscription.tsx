import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { presentPaywall, PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { PREMIUM_FEATURES, TRIAL_DAYS } from '../src/config/premiumFeatures';
import RevenueCatService from '../src/services/revenueCat.service';

export default function SubscriptionScreen() {
  const router = useRouter();
  const {
    isPremium,
    currentPlan,
    expirationDate,
    willRenew,
    isInTrial,
    trialEndDate,
    checkPremiumStatus,
  } = useSubscriptionStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          Alert.alert(
            'Welcome to Pro!',
            'Your subscription is now active. Enjoy unlimited access to all premium features.',
            [{ text: 'Get Started', onPress: () => router.back() }]
          );
          await checkPremiumStatus();
          break;

        case PAYWALL_RESULT.RESTORED:
          Alert.alert(
            'Subscription Restored',
            'Your previous subscription has been restored successfully.',
            [{ text: 'Continue', onPress: () => router.back() }]
          );
          await checkPremiumStatus();
          break;

        case PAYWALL_RESULT.CANCELLED:
          // User dismissed paywall
          break;

        case PAYWALL_RESULT.ERROR:
          Alert.alert(
            'Error',
            'Something went wrong. Please try again later.'
          );
          break;
      }
    } catch (error) {
      console.error('Paywall error:', error);
      Alert.alert('Error', 'Failed to load subscription options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await RevenueCatService.restorePurchases();

      if (result.success && result.customerInfo) {
        const hasEntitlement = result.customerInfo.entitlements.active['gigguard_pro'] !== undefined;

        if (hasEntitlement) {
          Alert.alert(
            'Success',
            'Your subscription has been restored!',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          await checkPremiumStatus();
        } else {
          Alert.alert(
            'No Subscription Found',
            'We could not find any active subscriptions linked to this account.'
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to restore purchases');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    router.push('/customer-center');
  };

  // Premium user view
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Premium badge */}
          <View style={styles.premiumBadgeContainer}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumBadge}
            >
              <Ionicons name="star" size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.premiumTitle}>You're on Pro!</Text>
            {isInTrial && trialEndDate && (
              <Text style={styles.trialInfo}>
                Trial ends {new Date(trialEndDate).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Subscription details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>
                {currentPlan === 'monthly' ? 'Monthly' : currentPlan === 'yearly' ? 'Yearly' : currentPlan === 'lifetime' ? 'Lifetime' : 'Pro'}
              </Text>
            </View>

            {expirationDate && currentPlan !== 'lifetime' && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {willRenew ? 'Renews' : 'Expires'}
                </Text>
                <Text style={styles.detailValue}>
                  {new Date(expirationDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>

          {/* Premium features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Your Premium Features</Text>
            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature.id} style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={24} color="#3B82F6" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            ))}
          </View>

          {/* Manage button */}
          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Free user view - show paywall
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroIcon}
            >
              <Ionicons name="star" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock unlimited income tracking, tax tools, and professional invoicing
          </Text>
        </View>

        {/* Trial banner */}
        <View style={styles.trialBanner}>
          <Ionicons name="gift" size={24} color="#F59E0B" />
          <Text style={styles.trialBannerText}>
            Start your {TRIAL_DAYS}-day free trial today
          </Text>
        </View>

        {/* Features list */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={24} color="#3B82F6" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureName}>{feature.name}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.subscribeButtonText}>
                  Start Free Trial
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator color="#6B7280" />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Free for {TRIAL_DAYS} days, then billed as selected. Cancel anytime.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Hero (free user)
  hero: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  heroIconContainer: {
    marginBottom: 16,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Trial banner
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  trialBannerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },

  // Premium badge (premium user)
  premiumBadgeContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  premiumBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  trialInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Details card (premium user)
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },

  // Features
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Buttons
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  manageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  terms: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
