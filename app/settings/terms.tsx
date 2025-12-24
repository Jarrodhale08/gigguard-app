import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LAST_UPDATED = 'December 24, 2024';
const COMPANY_NAME = 'GigGuard';
const CONTACT_EMAIL = 'legal@gigguard.app';

export default function TermsScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)/settings')}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using the {COMPANY_NAME} mobile application ("App"),
            you agree to be bound by these Terms of Service ("Terms"). If you do not agree to
            these Terms, do not use the App.
          </Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. Your continued use of the
            App after any changes constitutes acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} is a financial management application designed for freelancers and
            gig economy workers. The App facilitates:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Tracking income from multiple gig platforms</Text>
            <Text style={styles.bulletItem}>• Logging and categorizing business expenses</Text>
            <Text style={styles.bulletItem}>• Estimating quarterly tax payments</Text>
            <Text style={styles.bulletItem}>• Creating and sending invoices to clients</Text>
            <Text style={styles.bulletItem}>• Setting and tracking financial savings goals</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To use certain features of the App, you must create an account. You agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide accurate and complete registration information</Text>
            <Text style={styles.bulletItem}>• Maintain the security of your account credentials</Text>
            <Text style={styles.bulletItem}>• Promptly notify us of any unauthorized account use</Text>
            <Text style={styles.bulletItem}>• Be responsible for all activities under your account</Text>
          </View>
          <Text style={styles.paragraph}>
            You must be at least 18 years old to create an account and use the financial
            tracking features of this App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use the App to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Violate any applicable laws or regulations</Text>
            <Text style={styles.bulletItem}>• Submit false, misleading, or fraudulent financial data</Text>
            <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to the App</Text>
            <Text style={styles.bulletItem}>• Interfere with the proper functioning of the App</Text>
            <Text style={styles.bulletItem}>• Use the App for money laundering or illegal activities</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Financial Data Disclaimer</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} provides tools for tracking finances and estimating taxes.
            However, this App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Does NOT provide professional tax, legal, or financial advice</Text>
            <Text style={styles.bulletItem}>• Is NOT a substitute for a licensed accountant or tax professional</Text>
            <Text style={styles.bulletItem}>• Provides estimates that may not reflect your actual tax liability</Text>
          </View>
          <Text style={styles.paragraph}>
            You are solely responsible for verifying all financial information and consulting
            with qualified professionals for tax and financial advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Subscriptions and Payments</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} offers premium subscription plans with enhanced features. By
            purchasing a subscription, you agree to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Pay all applicable fees and charges</Text>
            <Text style={styles.bulletItem}>• Automatic renewal unless cancelled before the renewal date</Text>
            <Text style={styles.bulletItem}>• Cancellation through your App Store or Play Store account</Text>
          </View>
          <Text style={styles.paragraph}>
            Free trials automatically convert to paid subscriptions unless cancelled. Refunds
            are handled according to the policies of the Apple App Store or Google Play Store.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The App, including its content, features, and functionality, is owned by
            {COMPANY_NAME} and protected by intellectual property laws. You retain ownership
            of your financial data but grant us a license to process it within the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE
            THAT THE APP WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. TAX ESTIMATES AND
            FINANCIAL CALCULATIONS ARE FOR INFORMATIONAL PURPOSES ONLY.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY_NAME.toUpperCase()} SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
            ARISING FROM YOUR USE OF THE APP, INCLUDING ANY FINANCIAL LOSSES OR TAX PENALTIES.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate your account at any time for violations of these Terms
            or for any other reason at our discretion. Upon termination, your right to use the
            App immediately ceases.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by the laws of the jurisdiction in which {COMPANY_NAME}
            operates, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Open Source Software</Text>
          <Text style={styles.paragraph}>
            This App uses open source software licensed under the MIT License, including
            React Native, Expo, Supabase, Zustand, and other libraries. Full license terms
            are available at{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://opensource.org/licenses/MIT')}>
              opensource.org/licenses/MIT
            </Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about these Terms, please contact us at:
          </Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.link}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 4,
  },
  link: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
