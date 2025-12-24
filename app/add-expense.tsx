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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../src/stores/financeStore';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';
import { FREE_TIER_LIMITS, hasReachedLimit } from '../src/config/premiumFeatures';

const EXPENSE_CATEGORIES = [
  'Fuel',
  'Vehicle Maintenance',
  'Car Wash',
  'Parking',
  'Tolls',
  'Phone Bill',
  'Internet',
  'Office Supplies',
  'Software/Apps',
  'Meals',
  'Other',
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const { addExpense, expenses } = useFinanceStore();
  const { isPremium } = useSubscriptionStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDeductible, setIsDeductible] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check monthly limit on mount
  useEffect(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
    const limitReached = hasReachedLimit('maxExpenses', thisMonthExpenses.length, isPremium);

    if (limitReached) {
      Alert.alert(
        'Upgrade Required',
        `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxExpenses} expenses per month. Upgrade to Pro for unlimited expense tracking!`,
        [
          { text: 'Maybe Later', onPress: () => router.back() },
          { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
        ]
      );
    }
  }, [expenses, isPremium, router]);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSaving(true);

    try {
      const result = await addExpense({
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        date,
        is_deductible: isDeductible,
        notes: notes.trim() || undefined,
      });

      if (result.requiresUpgrade) {
        Alert.alert(
          'Upgrade Required',
          `You've reached the free tier limit of ${FREE_TIER_LIMITS.maxExpenses} expenses this month. Upgrade to Pro for unlimited expense tracking!`,
          [
            { text: 'Maybe Later', onPress: () => router.back() },
            { text: 'Upgrade Now', onPress: () => router.replace('/subscription') },
          ]
        );
      } else if (result.success) {
        Alert.alert('Success', 'Expense added successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add expense');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setIsSaving(false);
    }
  };

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
  const remainingExpenses = isPremium
    ? Infinity
    : Math.max(0, FREE_TIER_LIMITS.maxExpenses - thisMonthExpenses.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Free tier warning */}
        {!isPremium && remainingExpenses <= 5 && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              {remainingExpenses} expenses left this month
            </Text>
            <TouchableOpacity onPress={() => router.push('/subscription')}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Gas for deliveries"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryChip,
                  category === c && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === c && styles.categoryChipTextActive,
                  ]}
                >
                  {c}
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

        {/* Tax Deductible */}
        <View style={styles.field}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="receipt" size={20} color="#3B82F6" />
              <Text style={styles.switchText}>Tax Deductible</Text>
            </View>
            <Switch
              value={isDeductible}
              onValueChange={setIsDeductible}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={isDeductible ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
          <Text style={styles.helpText}>
            Mark if this expense can be deducted from your taxable income
          </Text>
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
              <Text style={styles.saveButtonText}>Save Expense</Text>
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

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#EF4444',
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

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
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
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#EF4444',
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
