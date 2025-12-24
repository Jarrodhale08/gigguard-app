import React, { memo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

function Input({
  label,
  error,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  inputStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    styles[`container_${size}`],
    styles[`container_${variant}`],
    isFocused && styles.containerFocused,
    error && styles.containerError,
    disabled && styles.containerDisabled,
    style,
  ];

  const textStyle = [
    styles.input,
    styles[`input_${size}`],
    styles[`input_${variant}`],
    disabled && styles.inputDisabled,
    inputStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, styles[`label_${size}`], disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      <TextInput
        style={textStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        accessibilityLabel={label || textInputProps.placeholder}
        accessibilityState={{ disabled }}
        placeholderTextColor="#9CA3AF"
        {...textInputProps}
      />
      {error && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2937',
  },
  label_sm: {
    fontSize: 12,
  },
  label_md: {
    fontSize: 14,
  },
  label_lg: {
    fontSize: 16,
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
  },
  container_sm: {
    minHeight: 36,
  },
  container_md: {
    minHeight: 44,
  },
  container_lg: {
    minHeight: 52,
  },
  container_primary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  container_secondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderColor: '#6B7280',
  },
  container_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  containerFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  containerError: {
    borderColor: '#EF4444',
  },
  containerDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  input: {
    paddingHorizontal: 12,
    color: '#1F2937',
    fontWeight: '400',
  },
  input_sm: {
    fontSize: 13,
    paddingVertical: 6,
  },
  input_md: {
    fontSize: 15,
    paddingVertical: 10,
  },
  input_lg: {
    fontSize: 17,
    paddingVertical: 14,
  },
  input_primary: {
    color: '#1F2937',
  },
  input_secondary: {
    color: '#1F2937',
  },
  input_outline: {
    color: '#1F2937',
  },
  input_ghost: {
    color: '#1F2937',
  },
  input_danger: {
    color: '#DC2626',
  },
  inputDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});

export { Input };
export default memo(Input);
