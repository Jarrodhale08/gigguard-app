import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore, Gig } from '../../src/stores/financeStore';

export default function GigDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gigs, updateGig, deleteGig } = useFinanceStore();

  const [gig, setGig] = useState<Gig | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const foundGig = gigs.find(g => g.id === id);
    if (foundGig) {
      setGig(foundGig);
    } else {
      Alert.alert('Error', 'Gig not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id, gigs]);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'disputed') => {
    if (!gig) return;

    try {
      await updateGig(gig.id, { status: newStatus });
      setGig({ ...gig, status: newStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Gig',
      'Are you sure you want to delete this gig? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteGig(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete gig');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!gig) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = {
    pending: { bg: '#FEF3C7', text: '#92400E', icon: 'time' },
    completed: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' },
    disputed: { bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' },
  };

  const statusColor = statusColors[gig.status];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gig Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} disabled={isDeleting}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Amount card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Earned</Text>
          <Text style={styles.amountValue}>${gig.amount.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Ionicons name={statusColor.icon as any} size={16} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="briefcase" size={20} color="#3B82F6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Title</Text>
                <Text style={styles.detailValue}>{gig.title}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="apps" size={20} color="#3B82F6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Platform</Text>
                <Text style={styles.detailValue}>{gig.platform}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(gig.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {gig.notes && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="document-text" size={20} color="#3B82F6" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{gig.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Status update */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>

          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[
                styles.statusOption,
                gig.status === 'pending' && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange('pending')}
            >
              <Ionicons
                name="time"
                size={24}
                color={gig.status === 'pending' ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  gig.status === 'pending' && styles.statusOptionTextActive,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                gig.status === 'completed' && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange('completed')}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={gig.status === 'completed' ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  gig.status === 'completed' && styles.statusOptionTextActive,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                gig.status === 'disputed' && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange('disputed')}
            >
              <Ionicons
                name="alert-circle"
                size={24}
                color={gig.status === 'disputed' ? '#EF4444' : '#6B7280'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  gig.status === 'disputed' && styles.statusOptionTextActive,
                ]}
              >
                Disputed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },

  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
