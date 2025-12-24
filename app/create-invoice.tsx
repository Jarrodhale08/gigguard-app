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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../src/stores/financeStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { FREE_TIER_LIMITS, hasReachedLimit } from '../src/config/premiumFeatures';

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { createInvoice, invoices, clients } = useFinanceStore();
  const { isPremium } = useSubscriptionStore();

  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calculate default due date (30 days from now)
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  // Check monthly limit on mount
  useEffect(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthInvoices = invoices.filter(i => i.created_at?.startsWith(thisMonth));
    const limitReached = hasReachedLimit('maxInvoicesPerMonth', thisMonthInvoices.length, isPremium);

    if (limitReached) {
      Alert.alert(
        'Upgrade Required',
        `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxInvoicesPerMonth} invoices per month. Upgrade to Pro for unlimited invoicing!`,
        [
          { text: 'Maybe Later', onPress: () => router.back() },
          { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
        ]
      );
    }
  }, [invoices, isPremium, router]);

  const handleSave = async () => {
    // Validation
    if (!clientName.trim()) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!dueDate) {
      Alert.alert('Error', 'Please enter a due date');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setIsSaving(true);

    try {
      const result = await createInvoice({
        client_id: '', // Will be generated
        client_name: clientName.trim(),
        amount: parseFloat(amount),
        status: 'draft',
        due_date: dueDate,
        items: [
          {
            description: description.trim(),
            amount: parseFloat(amount),
          },
        ],
      });

      if (result.requiresUpgrade) {
        Alert.alert(
          'Upgrade Required',
          `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxInvoicesPerMonth} invoices this month. Upgrade to Pro for unlimited invoicing!`,
          [
            { text: 'Maybe Later', onPress: () => router.back() },
            { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
          ]
        );
      } else if (result.success) {
        Alert.alert(
          'Invoice Created',
          'Your invoice has been created successfully. You can now send it to your client.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to create invoice');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthInvoices = invoices.filter(i => i.created_at?.startsWith(thisMonth));
  const remainingInvoices = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.maxInvoicesPerMonth - thisMonthInvoices.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Invoice</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Free tier warning */}
        {!isPremium && remainingInvoices <= 2 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              {remainingInvoices} invoices left this month
            </Text>
            <TouchableOpacity onPress={() => router.push('/subscription')}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Premium feature banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push('/subscription')}
          >
            <Ionicons name="star" size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumBannerTitle}>Unlock Pro Invoicing</Text>
              <Text style={styles.premiumBannerText}>
                Get unlimited invoices, custom branding, and recurring billing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Client Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Client Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g., Acme Corporation"
            placeholderTextColor="#9CA3AF"
          />
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

        {/* Due Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Due Date <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.dateInputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.dateInput}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Text style={styles.helpText}>
            Default: 30 days from today
          </Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the services provided..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Invoice Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Invoice Preview</Text>
          <View style={styles.previewDivider} />

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Bill To:</Text>
            <Text style={styles.previewValue}>{clientName || 'Client Name'}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Amount:</Text>
            <Text style={styles.previewAmount}>
              ${amount || '0.00'}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Due Date:</Text>
            <Text style={styles.previewValue}>
              {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}
            </Text>
          </View>

          {description && (
            <>
              <View style={styles.previewDivider} />
              <Text style={styles.previewLabel}>Services:</Text>
              <Text style={styles.previewDescription}>{description}</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Create button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isSaving && styles.createButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Invoice</Text>
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

  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  premiumBannerText: {
    fontSize: 13,
    color: '#B45309',
    marginTop: 2,
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
    height: 120,
    paddingTop: 16,
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

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },

  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  previewValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  previewAmount: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '700',
  },
  previewDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
  },

  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
