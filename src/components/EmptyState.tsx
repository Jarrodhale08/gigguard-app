import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function EmptyState({
  title = 'No Data',
  message = 'There is no data to display at the moment.',
  icon = 'folder-open-outline',
  variant = 'primary',
  size = 'md',
  style,
}: EmptyStateProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[styles.container, variantStyles.container, sizeStyles.container, style]}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${message}`}
    >
      <Ionicons
        name={icon}
        size={sizeStyles.iconSize}
        color={variantStyles.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.title, variantStyles.title, sizeStyles.title]}>
        {title}
      </Text>
      <Text style={[styles.message, variantStyles.message, sizeStyles.message]}>
        {message}
      </Text>
    </View>
  );
}

function getVariantStyles(variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger') {
  switch (variant) {
    case 'primary':
      return {
        container: styles.primaryContainer,
        iconColor: '#3B82F6',
        title: styles.primaryTitle,
        message: styles.primaryMessage,
      };
    case 'secondary':
      return {
        container: styles.secondaryContainer,
        iconColor: '#6B7280',
        title: styles.secondaryTitle,
        message: styles.secondaryMessage,
      };
    case 'outline':
      return {
        container: styles.outlineContainer,
        iconColor: '#3B82F6',
        title: styles.outlineTitle,
        message: styles.outlineMessage,
      };
    case 'ghost':
      return {
        container: styles.ghostContainer,
        iconColor: '#6B7280',
        title: styles.ghostTitle,
        message: styles.ghostMessage,
      };
    case 'danger':
      return {
        container: styles.dangerContainer,
        iconColor: '#EF4444',
        title: styles.dangerTitle,
        message: styles.dangerMessage,
      };
  }
}

function getSizeStyles(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        container: styles.smContainer,
        iconSize: 40,
        title: styles.smTitle,
        message: styles.smMessage,
      };
    case 'md':
      return {
        container: styles.mdContainer,
        iconSize: 56,
        title: styles.mdTitle,
        message: styles.mdMessage,
      };
    case 'lg':
      return {
        container: styles.lgContainer,
        iconSize: 72,
        title: styles.lgTitle,
        message: styles.lgMessage,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  primaryTitle: {
    color: '#1E40AF',
    fontSize: 18,
  } as TextStyle,
  primaryMessage: {
    color: '#3B82F6',
    fontSize: 14,
  } as TextStyle,
  secondaryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  secondaryTitle: {
    color: '#374151',
    fontSize: 18,
  } as TextStyle,
  secondaryMessage: {
    color: '#6B7280',
    fontSize: 14,
  } as TextStyle,
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
  },
  outlineTitle: {
    color: '#1E40AF',
    fontSize: 18,
  } as TextStyle,
  outlineMessage: {
    color: '#3B82F6',
    fontSize: 14,
  } as TextStyle,
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostTitle: {
    color: '#374151',
    fontSize: 18,
  } as TextStyle,
  ghostMessage: {
    color: '#6B7280',
    fontSize: 14,
  } as TextStyle,
  dangerContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  dangerTitle: {
    color: '#B91C1C',
    fontSize: 18,
  } as TextStyle,
  dangerMessage: {
    color: '#EF4444',
    fontSize: 14,
  } as TextStyle,
  smContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  smTitle: {
    fontSize: 14,
  } as TextStyle,
  smMessage: {
    fontSize: 12,
  } as TextStyle,
  mdContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mdTitle: {
    fontSize: 18,
  } as TextStyle,
  mdMessage: {
    fontSize: 14,
  } as TextStyle,
  lgContainer: {
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  lgTitle: {
    fontSize: 22,
  } as TextStyle,
  lgMessage: {
    fontSize: 16,
  } as TextStyle,
});

export { EmptyState };
export default memo(EmptyState);
