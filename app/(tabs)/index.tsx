import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../../src/stores/financeStore';
import { FREE_TIER_LIMITS } from '../../src/config/premiumFeatures';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const {
    gigs,
    isPremium,
    totalIncome,
    totalExpenses,
    estimatedTaxes,
    loadGigs,
    getThisMonthIncome,
    getThisMonthExpenses,
    getPendingInvoicesTotal,
  } = useFinanceStore();

  const fetchData = useCallback(async () => {
    try {
      await loadGigs();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadGigs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const thisMonthIncome = getThisMonthIncome();
  const thisMonthExpenses = getThisMonthExpenses();
  const pendingInvoices = getPendingInvoicesTotal();
  const netProfit = totalIncome - totalExpenses;

  const recentGigs = gigs.slice(-5).reverse();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>GigGuard</Text>
            <Text style={styles.subtitle}>Your Finances Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-gig')}
            accessibilityLabel="Add new gig"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Premium Banner - Show for free users */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/subscription')}
            accessibilityLabel="Upgrade to premium"
          >
            <View style={styles.premiumBannerContent}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Upgrade to Pro</Text>
                <Text style={styles.premiumBannerSubtitle}>
                  Unlock tax tools, unlimited invoicing & more
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValueLight}>${thisMonthIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="wallet-outline" size={24} color="#3B82F6" />
              <Text style={styles.statLabelDark}>Net Profit</Text>
              <Text style={[styles.statValue, netProfit < 0 && styles.statValueNegative]}>
                ${netProfit.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="receipt-outline" size={24} color="#EF4444" />
              <Text style={styles.statLabelDark}>Expenses</Text>
              <Text style={styles.statValue}>${thisMonthExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#10B981" />
              <Text style={styles.statLabelDark}>Pending</Text>
              <Text style={styles.statValue}>${pendingInvoices.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tax Estimate Card (Premium Feature) */}
        <TouchableOpacity
          style={[styles.taxCard, !isPremium && styles.taxCardLocked]}
          onPress={() => !isPremium && router.push('/subscription')}
          disabled={isPremium}
        >
          <View style={styles.taxCardHeader}>
            <Ionicons name="calculator" size={24} color={isPremium ? '#3B82F6' : '#9CA3AF'} />
            <Text style={[styles.taxCardTitle, !isPremium && styles.textMuted]}>
              Quarterly Tax Estimate
            </Text>
            {!isPremium && (
              <View style={styles.proBadge}>
                <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          {isPremium ? (
            <Text style={styles.taxAmount}>${(estimatedTaxes / 4).toFixed(2)}</Text>
          ) : (
            <Text style={styles.taxCardSubtitle}>Upgrade to see your estimated quarterly taxes</Text>
          )}
        </TouchableOpacity>

        {/* Free Tier Limits Info */}
        {!isPremium && (
          <View style={styles.limitsCard}>
            <Text style={styles.limitsTitle}>Free Plan Usage</Text>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Gigs Tracked</Text>
              <Text style={styles.limitValue}>
                {gigs.length} / {FREE_TIER_LIMITS.maxGigs}
              </Text>
            </View>
            <View style={styles.limitProgress}>
              <View
                style={[
                  styles.limitProgressFill,
                  { width: `${Math.min((gigs.length / FREE_TIER_LIMITS.maxGigs) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Recent Gigs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Gigs</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/details')}>
              <Text style={styles.seeAllLink}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentGigs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Gigs Yet</Text>
              <Text style={styles.emptyText}>
                Start tracking your gig income by tapping the + button above.
              </Text>
            </View>
          ) : (
            <View style={styles.gigsContainer}>
              {recentGigs.map((gig) => (
                <TouchableOpacity
                  key={gig.id}
                  style={styles.gigCard}
                  onPress={() => router.push(`/gig/${gig.id}`)}
                  accessibilityLabel={`${gig.title}, ${gig.amount} dollars, ${gig.status}`}
                >
                  <View style={styles.gigInfo}>
                    <Text style={styles.gigTitle}>{gig.title}</Text>
                    <Text style={styles.gigPlatform}>{gig.platform}</Text>
                  </View>
                  <View style={styles.gigRight}>
                    <Text style={styles.gigAmount}>${gig.amount.toFixed(2)}</Text>
                    <View style={[styles.statusBadge, styles[`status_${gig.status}`]]}>
                      <Text style={styles.statusText}>
                        {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/add-gig')}
            >
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
              <Text style={styles.actionLabel}>Add Gig</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/add-expense')}
            >
              <Ionicons name="receipt" size={28} color="#EF4444" />
              <Text style={styles.actionLabel}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/create-invoice')}
            >
              <Ionicons name="document-text" size={28} color="#10B981" />
              <Text style={styles.actionLabel}>Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/reports')}
            >
              <Ionicons name="bar-chart" size={28} color="#8B5CF6" />
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumBannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  premiumBannerText: { marginLeft: 12, flex: 1 },
  premiumBannerTitle: { fontSize: 16, fontWeight: '600', color: '#92400E' },
  premiumBannerSubtitle: { fontSize: 13, color: '#B45309', marginTop: 2 },

  statsContainer: { gap: 12, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardPrimary: { backgroundColor: '#3B82F6' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  statLabelDark: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 4 },
  statValueLight: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
  statValueNegative: { color: '#EF4444' },

  taxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taxCardLocked: { backgroundColor: '#F9FAFB' },
  taxCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taxCardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  textMuted: { color: '#9CA3AF' },
  taxAmount: { fontSize: 28, fontWeight: '700', color: '#3B82F6', marginTop: 12 },
  taxCardSubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  proBadgeText: { fontSize: 11, fontWeight: '700', color: '#F59E0B' },

  limitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  limitsTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  limitLabel: { fontSize: 14, color: '#374151' },
  limitValue: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  limitProgress: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  limitProgressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  seeAllLink: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },

  gigsContainer: { gap: 8 },
  gigCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 72,
  },
  gigInfo: { flex: 1 },
  gigTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  gigPlatform: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  gigRight: { alignItems: 'flex-end' },
  gigAmount: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  status_pending: { backgroundColor: '#FEF3C7' },
  status_completed: { backgroundColor: '#D1FAE5' },
  status_disputed: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#374151' },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 4, paddingHorizontal: 24 },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: '500', color: '#374151' },
});
