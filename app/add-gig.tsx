import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../src/stores/financeStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { FREE_TIER_LIMITS, hasReachedLimit } from '../src/config/premiumFeatures';

const PLATFORMS = [
  'Uber',
  'Lyft',
  'DoorDash',
  'Uber Eats',
  'Grubhub',
  'Instacart',
  'Fiverr',
  'Upwork',
  'TaskRabbit',
  'Other',
];

export default function AddGigScreen() {
  const router = useRouter();
  const { addGig, gigs } = useFinanceStore();
  const { isPremium } = useSubscriptionStore();

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'pending' | 'completed' | 'disputed'>('completed');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check limit on mount
  useEffect(() => {
    const limitReached = hasReachedLimit('maxGigs', gigs.length, isPremium);
    if (limitReached) {
      Alert.alert(
        'Upgrade Required',
        `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxGigs} gigs. Upgrade to Pro for unlimited gig tracking!`,
        [
          { text: 'Maybe Later', onPress: () => router.back() },
          { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
        ]
      );
    }
  }, [gigs.length, isPremium, router]);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a gig title');
      return;
    }

    if (!platform) {
      Alert.alert('Error', 'Please select a platform');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSaving(true);

    try {
      const result = await addGig({
        title: title.trim(),
        platform,
        amount: parseFloat(amount),
        date,
        status,
        notes: notes.trim() || undefined,
      });

      if (result.requiresUpgrade) {
        Alert.alert(
          'Upgrade Required',
          `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxGigs} gigs. Upgrade to Pro for unlimited gig tracking!`,
          [
            { text: 'Maybe Later', onPress: () => router.back() },
            { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
          ]
        );
      } else if (result.success) {
        Alert.alert('Success', 'Gig added successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add gig');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add gig');
    } finally {
      setIsSaving(false);
    }
  };

  const remainingGigs = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.maxGigs - gigs.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Gig</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Free tier warning */}
        {!isPremium && remainingGigs <= 3 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              {remainingGigs} free gigs remaining
            </Text>
            <TouchableOpacity onPress={() => router.push('/subscription')}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Evening shift deliveries"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Platform */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Platform <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.platformChip,
                  platform === p && styles.platformChipActive,
                ]}
                onPress={() => setPlatform(p)}
              >
                <Text
                  style={[
                    styles.platformChipText,
                    platform === p && styles.platformChipTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Amount <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[
                styles.statusOption,
                status === 'completed' && styles.statusOptionActive,
              ]}
              onPress={() => setStatus('completed')}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={status === 'completed' ? '#10B981' : '#6B7280'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  status === 'completed' && styles.statusOptionTextActive,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusOption,
                status === 'pending' && styles.statusOptionActive,
              ]}
              onPress={() => setStatus('pending')}
            >
              <Ionicons
                name="time"
                size={20}
                color={status === 'pending' ? '#F59E0B' : '#6B7280'}
              />
              <Text
                style={[
                  styles.statusOptionText,
                  status === 'pending' && styles.statusOptionTextActive,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional details..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Gig</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  upgradeLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },

  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },

  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  platformChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  platformChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  platformChipTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 16,
    paddingRight: 16,
  },

  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 6,
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

  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
