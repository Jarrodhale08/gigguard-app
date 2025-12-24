import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

function Header({
  title = 'Header',
  subtitle,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: HeaderProps) {
  const containerStyle: ViewStyle[] = [
    styles.container,
    styles[`container_${variant}`] as ViewStyle,
    styles[`container_${size}`] as ViewStyle,
    disabled && styles.container_disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const titleStyle: TextStyle[] = [
    styles.title,
    styles[`title_${variant}`] as TextStyle,
    styles[`title_${size}`] as TextStyle,
    disabled && styles.title_disabled,
  ].filter(Boolean) as TextStyle[];

  const subtitleStyle: TextStyle[] = [
    styles.subtitle,
    styles[`subtitle_${variant}`] as TextStyle,
    styles[`subtitle_${size}`] as TextStyle,
    disabled && styles.subtitle_disabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <View
      style={containerStyle}
      accessibilityRole="header"
      accessibilityLabel={title}
    >
      <Text style={titleStyle}>{title}</Text>
      {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
  },
  container_primary: {
    backgroundColor: '#3B82F6',
  },
  container_secondary: {
    backgroundColor: '#6B7280',
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  container_ghost: {
    backgroundColor: 'transparent',
  },
  container_danger: {
    backgroundColor: '#EF4444',
  },
  container_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  container_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  container_lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  container_disabled: {
    opacity: 0.5,
  },
  title: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title_primary: {
    color: '#FFFFFF',
  },
  title_secondary: {
    color: '#FFFFFF',
  },
  title_outline: {
    color: '#3B82F6',
  },
  title_ghost: {
    color: '#1F2937',
  },
  title_danger: {
    color: '#FFFFFF',
  },
  title_sm: {
    fontSize: 18,
  },
  title_md: {
    fontSize: 22,
  },
  title_lg: {
    fontSize: 26,
  },
  title_disabled: {
    color: '#9CA3AF',
  },
  subtitle: {
    marginTop: 4,
    color: '#E5E7EB',
  },
  subtitle_primary: {
    color: '#E5E7EB',
  },
  subtitle_secondary: {
    color: '#E5E7EB',
  },
  subtitle_outline: {
    color: '#6B7280',
  },
  subtitle_ghost: {
    color: '#6B7280',
  },
  subtitle_danger: {
    color: '#FEE2E2',
  },
  subtitle_sm: {
    fontSize: 12,
  },
  subtitle_md: {
    fontSize: 14,
  },
  subtitle_lg: {
    fontSize: 16,
  },
  subtitle_disabled: {
    color: '#D1D5DB',
  },
});

export default memo(Header);
export { Header };
export type { HeaderProps };
