import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again',
  onRetry,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: ErrorStateProps) {
  const containerStyle = [
    styles.container,
    styles[`container_${size}`],
    style,
  ];

  const buttonStyle = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    styles[`buttonText_${variant}`],
    styles[`buttonText_${size}`],
    disabled && styles.buttonText_disabled,
  ];

  const titleStyle = [
    styles.title,
    styles[`title_${size}`],
  ];

  const messageStyle = [
    styles.message,
    styles[`message_${size}`],
  ];

  return (
    <View style={containerStyle} accessibilityRole="alert">
      <Text style={titleStyle} accessibilityLabel={title}>
        {title}
      </Text>
      <Text style={messageStyle} accessibilityLabel={message}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={buttonStyle}
          onPress={onRetry}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityState={{ disabled }}
        >
          <Text style={buttonTextStyle}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container_sm: {
    padding: 16,
  },
  container_md: {
    padding: 24,
  },
  container_lg: {
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  title_sm: {
    fontSize: 16,
    marginBottom: 4,
  },
  title_md: {
    fontSize: 18,
    marginBottom: 8,
  },
  title_lg: {
    fontSize: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  message_sm: {
    fontSize: 12,
    marginBottom: 12,
  },
  message_md: {
    fontSize: 14,
    marginBottom: 16,
  },
  message_lg: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  button_sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  button_md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  button_lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 10,
  },
  button_primary: {
    backgroundColor: '#3B82F6',
  },
  button_secondary: {
    backgroundColor: '#6B7280',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_danger: {
    backgroundColor: '#EF4444',
  },
  button_disabled: {
    backgroundColor: '#D1D5DB',
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText_sm: {
    fontSize: 14,
  },
  buttonText_md: {
    fontSize: 16,
  },
  buttonText_lg: {
    fontSize: 18,
  },
  buttonText_primary: {
    color: '#FFFFFF',
  },
  buttonText_secondary: {
    color: '#FFFFFF',
  },
  buttonText_outline: {
    color: '#3B82F6',
  },
  buttonText_ghost: {
    color: '#3B82F6',
  },
  buttonText_danger: {
    color: '#FFFFFF',
  },
  buttonText_disabled: {
    color: '#9CA3AF',
  },
});

export { ErrorState };
export default memo(ErrorState);
