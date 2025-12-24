import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { presentCustomerCenter } from 'react-native-purchases-ui';

export default function CustomerCenterScreen() {
  const router = useRouter();

  useEffect(() => {
    openCustomerCenter();
  }, []);

  const openCustomerCenter = async () => {
    try {
      // Present RevenueCat's native customer center
      await presentCustomerCenter();

      // Navigate back when customer center is dismissed
      router.back();
    } catch (error) {
      console.error('Failed to open customer center:', error);

      // Fallback: Open subscription management in browser
      if (Platform.OS === 'ios') {
        Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else if (Platform.OS === 'android') {
        Linking.openURL('https://play.google.com/store/account/subscriptions');
      }

      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content} />
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
  },
});
