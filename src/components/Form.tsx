import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

interface FormProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const FormField = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  variant = 'primary',
  size = 'md',
  style,
}: FormFieldProps) => {
  const inputHeight = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;

  const getBorderColor = () => {
    if (error) return '#EF4444';
    if (variant === 'danger') return '#EF4444';
    if (variant === 'primary') return '#3B82F6';
    if (variant === 'secondary') return '#6B7280';
    return '#D1D5DB';
  };

  const getBackgroundColor = () => {
    if (disabled) return '#F3F4F6';
    if (variant === 'ghost') return 'transparent';
    return '#FFFFFF';
  };

  const sanitizedValue = value.trim().slice(0, 1000);

  return (
    <View style={[styles.fieldContainer, style]}>
      <Text 
        style={[
          styles.label,
          { fontSize: fontSize - 2 },
          error && styles.labelError,
          disabled && styles.labelDisabled
        ]}
        accessibilityLabel={label}
      >
        {label}
      </Text>
      <TextInput
        value={sanitizedValue}
        onChangeText={(text) => onChangeText(text.trim().slice(0, 1000))}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[
          styles.input,
          {
            height: multiline ? inputHeight * 2 : inputHeight,
            fontSize,
            paddingHorizontal,
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          disabled && styles.inputDisabled,
          error && styles.inputError,
        ]}
        placeholderTextColor="#9CA3AF"
        accessibilityLabel={`${label} input`}
        accessibilityHint={error || placeholder}
        accessibilityState={{ disabled }}
      />
      {error && (
        <Text 
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

FormField.displayName = 'FormField';

function Form({
  children,
  variant = 'primary',
  size = 'md',
  style,
}: FormProps) {
  const paddingVertical = size === 'sm' ? 12 : size === 'lg' ? 24 : 16;
  const gap = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;

  return (
    <View 
      style={[
        styles.formContainer,
        { paddingVertical, gap },
        style
      ]}
      accessibilityRole="form"
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 4,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  labelError: {
    color: '#EF4444',
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    color: '#1F2937',
    minHeight: 44,
  },
  inputDisabled: {
    opacity: 0.6,
    color: '#6B7280',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default memo(Form);
