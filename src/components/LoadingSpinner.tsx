import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function LoadingSpinner({
  variant = 'primary',
  size = 'md',
  style,
}: LoadingSpinnerProps) {
  const getColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#3B82F6';
      case 'secondary':
        return '#6B7280';
      case 'outline':
        return '#3B82F6';
      case 'ghost':
        return '#6B7280';
      case 'danger':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const getSize = (): 'small' | 'large' => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      case 'md':
      default:
        return 'large';
    }
  };

  const getContainerSize = (): number => {
    switch (size) {
      case 'sm':
        return 44;
      case 'md':
        return 56;
      case 'lg':
        return 72;
      default:
        return 56;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { minHeight: getContainerSize(), minWidth: getContainerSize() },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator size={getSize()} color={getColor()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { LoadingSpinner };
export default memo(LoadingSpinner);
