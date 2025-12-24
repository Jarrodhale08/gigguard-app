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
const CONTACT_EMAIL = 'privacy@gigguard.app';

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our mobile application.
          </Text>
          <Text style={styles.paragraph}>
            Please read this Privacy Policy carefully. By using {COMPANY_NAME}, you agree to
            the collection and use of information in accordance with this policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.subTitle}>Personal Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we may collect:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Email address</Text>
            <Text style={styles.bulletItem}>• Name and display name</Text>
            <Text style={styles.bulletItem}>• Profile picture (optional)</Text>
          </View>

          <Text style={styles.subTitle}>Financial Data</Text>
          <Text style={styles.paragraph}>
            To provide our services, we collect and store:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Gig income records and platforms</Text>
            <Text style={styles.bulletItem}>• Business expense data and categories</Text>
            <Text style={styles.bulletItem}>• Invoice information and client details</Text>
            <Text style={styles.bulletItem}>• Savings goals and progress</Text>
            <Text style={styles.bulletItem}>• Tax estimation calculations</Text>
          </View>

          <Text style={styles.subTitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain information when you use the App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Device type and operating system</Text>
            <Text style={styles.bulletItem}>• App usage patterns and features accessed</Text>
            <Text style={styles.bulletItem}>• Crash reports and error logs</Text>
            <Text style={styles.bulletItem}>• Performance metrics</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide and maintain the App's functionality</Text>
            <Text style={styles.bulletItem}>• Calculate tax estimates and financial summaries</Text>
            <Text style={styles.bulletItem}>• Generate invoices and track payments</Text>
            <Text style={styles.bulletItem}>• Sync your data across devices (premium feature)</Text>
            <Text style={styles.bulletItem}>• Send push notifications for reminders</Text>
            <Text style={styles.bulletItem}>• Improve and optimize the App</Text>
            <Text style={styles.bulletItem}>• Respond to customer support requests</Text>
            <Text style={styles.bulletItem}>• Process subscription payments</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            Your financial data is stored securely using industry-standard encryption.
            We use Supabase for cloud storage with Row Level Security (RLS) policies to
            ensure your data is only accessible to you.
          </Text>
          <Text style={styles.paragraph}>
            Local data on your device is stored using encrypted storage mechanisms
            provided by the mobile operating system.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal or financial information. We may share your
            information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• With service providers who assist in operating the App</Text>
            <Text style={styles.bulletItem}>• To comply with legal obligations</Text>
            <Text style={styles.bulletItem}>• To protect our rights and prevent fraud</Text>
            <Text style={styles.bulletItem}>• With your consent</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            We use the following third-party services:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Supabase - Database and authentication</Text>
            <Text style={styles.bulletItem}>• RevenueCat - Subscription management</Text>
            <Text style={styles.bulletItem}>• Apple App Store / Google Play - Payment processing</Text>
            <Text style={styles.bulletItem}>• Expo - App development and push notifications</Text>
          </View>
          <Text style={styles.paragraph}>
            Each of these services has their own privacy policy governing their use of
            your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access your personal data</Text>
            <Text style={styles.bulletItem}>• Correct inaccurate data</Text>
            <Text style={styles.bulletItem}>• Request deletion of your data</Text>
            <Text style={styles.bulletItem}>• Export your data</Text>
            <Text style={styles.bulletItem}>• Opt-out of marketing communications</Text>
            <Text style={styles.bulletItem}>• Disable analytics and crash reporting</Text>
          </View>
          <Text style={styles.paragraph}>
            You can exercise these rights through the Privacy Settings screen in the App
            or by contacting us directly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal and financial data for as long as your account is
            active or as needed to provide you services. You can request deletion of
            your data at any time through the Privacy Settings screen.
          </Text>
          <Text style={styles.paragraph}>
            After account deletion, we may retain certain information for legal
            compliance, fraud prevention, or dispute resolution for up to 7 years.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            {COMPANY_NAME} is not intended for use by individuals under the age of 18.
            We do not knowingly collect personal information from children. If you are
            a parent or guardian and believe your child has provided us with personal
            information, please contact us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of
            any changes by posting the new Privacy Policy on this page and updating the
            "Last Updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions or concerns about this Privacy Policy or our data
            practices, please contact us at:
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
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
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
