import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GoalsScreen() {
  const [goals, setGoals] = useState({
    monthlySavings: '500',
    dailyBudget: '50',
    emergencyFund: '5000',
  });

  const handleSave = useCallback(() => {
    Keyboard.dismiss();
    Alert.alert('Success', 'Your goals have been updated!');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>
            Set your goals to stay motivated and track your progress.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="wallet-outline" size={24} color="#3B82F6" />
                <Text style={styles.goalTitle}>Monthly Savings Goal</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.monthlySavings}
                  onChangeText={(text) =>
                    setGoals({ ...goals, monthlySavings: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="500"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>dollars</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>Recommended: 20% of income</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="cash-outline" size={24} color="#3B82F6" />
                <Text style={styles.goalTitle}>Daily Spending Limit</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.dailyBudget}
                  onChangeText={(text) =>
                    setGoals({ ...goals, dailyBudget: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="50"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>dollars</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>Helps control daily expenses</Text>
            </View>

            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Ionicons name="shield-outline" size={24} color="#3B82F6" />
                <Text style={styles.goalTitle}>Emergency Fund Target</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={goals.emergencyFund}
                  onChangeText={(text) =>
                    setGoals({ ...goals, emergencyFund: text.replace(/[^0-9]/g, '') })
                  }
                  keyboardType="number-pad"
                  maxLength={7}
                  placeholder="5000"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.inputUnit}>dollars</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={Keyboard.dismiss}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              <Text style={styles.goalHint}>3-6 months of expenses</Text>
            </View>

          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Goals</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minHeight: 50,
  },
  inputUnit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
    minWidth: 70,
  },
  doneButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
