import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageSourcePropType } from 'react-native';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  imageSource?: ImageSourcePropType;
  initials?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

function Avatar({
  size = 'md',
  variant = 'primary',
  imageSource,
  initials,
  disabled = false,
  style,
}: AvatarProps) {
  const containerStyle = [
    styles.container,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_${variant}`],
  ];

  return (
    <View
      style={containerStyle}
      accessibilityRole="image"
      accessibilityLabel={initials ? `Avatar with initials ${initials}` : 'Avatar'}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={[styles.image, styles[`size_${size}`]]}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={textStyle}>{initials || '?'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 9999,
  },
  size_sm: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
  },
  size_md: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
  },
  size_lg: {
    width: 64,
    height: 64,
    minWidth: 64,
    minHeight: 64,
  },
  variant_primary: {
    backgroundColor: '#3B82F6',
  },
  variant_secondary: {
    backgroundColor: '#6B7280',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  variant_ghost: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  variant_danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    borderRadius: 9999,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 12,
  } as TextStyle,
  text_md: {
    fontSize: 16,
  } as TextStyle,
  text_lg: {
    fontSize: 24,
  } as TextStyle,
  text_primary: {
    color: '#FFFFFF',
  } as TextStyle,
  text_secondary: {
    color: '#FFFFFF',
  } as TextStyle,
  text_outline: {
    color: '#3B82F6',
  } as TextStyle,
  text_ghost: {
    color: '#3B82F6',
  } as TextStyle,
  text_danger: {
    color: '#FFFFFF',
  } as TextStyle,
});

export { Avatar };
export default memo(Avatar);
