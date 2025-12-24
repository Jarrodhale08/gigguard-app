import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface CardProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

function Card({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  testID,
}: CardProps) {
  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Container` as keyof typeof styles] as ViewStyle,
    styles[`${size}Container` as keyof typeof styles] as ViewStyle,
    disabled && styles.disabledContainer,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.baseText,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
    disabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const content = (
    <>
      {loading && <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#3B82F6'} style={styles.loader} />}
      {!loading && title && <Text style={textStyles}>{title}</Text>}
      {!loading && children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title || 'Card button'}
        accessibilityState={{ disabled: disabled || loading }}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} accessibilityRole="text" testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  primaryContainer: {
    backgroundColor: '#3B82F6',
    borderWidth: 0,
  },
  secondaryContainer: {
    backgroundColor: '#6B7280',
    borderWidth: 0,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
    borderWidth: 0,
  },
  smContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  mdContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lgContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 48,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#3B82F6',
  },
  ghostText: {
    color: '#3B82F6',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
});

export { Card };
export default memo(Card);
