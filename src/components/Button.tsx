import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

function Button({
  title = 'Button',
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const containerStyles: ViewStyle[] = [styles.container, styles[`${variant}Container`], styles[`${size}Container`]];
  const textStyles: TextStyle[] = [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];

  if (disabled || loading) {
    containerStyles.push(styles.disabledContainer);
    textStyles.push(styles.disabledText);
  }

  if (style) {
    containerStyles.push(style);
  }

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#3B82F6'}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    borderRadius: 8,
  },
  primaryContainer: {
    backgroundColor: '#3B82F6',
  },
  secondaryContainer: {
    backgroundColor: '#6B7280',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
  },
  smContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mdContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lgContainer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  text: {
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
    opacity: 1,
  },
});

export { Button };
export default memo(Button);
