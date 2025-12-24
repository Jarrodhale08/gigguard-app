import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { TRIAL_DAYS } from '../src/config/premiumFeatures';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isPremium: boolean;
}

const ONBOARDING_SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Track All Your Gigs',
    description: 'Manage income from Uber, DoorDash, Fiverr, and all your freelance work in one place',
    icon: 'briefcase',
    iconColor: '#3B82F6',
    isPremium: false,
  },
  {
    id: '2',
    title: 'Smart Expense Tracking',
    description: 'Log business expenses and categorize deductions automatically to maximize your tax savings',
    icon: 'receipt',
    iconColor: '#EF4444',
    isPremium: false,
  },
  {
    id: '3',
    title: 'Quarterly Tax Estimates',
    description: 'Never miss a tax deadline with automated quarterly tax calculations and reminders',
    icon: 'calculator',
    iconColor: '#8B5CF6',
    isPremium: true,
  },
  {
    id: '4',
    title: 'Professional Invoicing',
    description: 'Create and send unlimited invoices with custom branding and payment reminders',
    icon: 'document-text',
    iconColor: '#10B981',
    isPremium: true,
  },
  {
    id: '5',
    title: 'Advanced Analytics',
    description: 'Get detailed reports, income projections, and profit margin analysis to grow your business',
    icon: 'stats-chart',
    iconColor: '#F59E0B',
    isPremium: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('gigguard_onboarding_complete', 'true');
    router.replace('/(tabs)');
  };

  const handleStartTrial = async () => {
    await AsyncStorage.setItem('gigguard_onboarding_complete', 'true');
    router.replace('/subscription');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}15` }]}>
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </View>
        {item.isPremium && (
          <View style={styles.proBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#EFF6FF']}
        style={styles.gradient}
      >
        {/* Skip button */}
        {!isLastSlide && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={ONBOARDING_SLIDES}
          renderItem={renderSlide}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          {isLastSlide ? (
            <>
              {/* Trial CTA */}
              <TouchableOpacity
                style={styles.trialButton}
                onPress={handleStartTrial}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.trialButtonGradient}
                >
                  <Text style={styles.trialButtonText}>
                    Start {TRIAL_DAYS}-Day Free Trial
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Free continue option */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleSkip}
              >
                <Text style={styles.continueText}>Continue Free</Text>
              </TouchableOpacity>

              {/* Trial terms */}
              <Text style={styles.trialTerms}>
                Start your free {TRIAL_DAYS}-day trial. Cancel anytime. No credit card required to start.
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Slide
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#3B82F6',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },

  // Bottom CTA
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 12,
  },
  trialButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trialButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  trialButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  trialTerms: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
