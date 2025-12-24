import React, { memo } from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle, TextStyle, ListRenderItem } from 'react-native';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface ListProps {
  data: ListItem[];
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  onItemPress?: (item: ListItem) => void;
  emptyText?: string;
}

function List({
  data,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  onItemPress,
  emptyText = 'No items',
}: ListProps) {
  const containerStyle = [
    styles.container,
    variant === 'primary' && styles.primaryContainer,
    variant === 'secondary' && styles.secondaryContainer,
    variant === 'outline' && styles.outlineContainer,
    variant === 'ghost' && styles.ghostContainer,
    variant === 'danger' && styles.dangerContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const itemStyle = [
    styles.item,
    size === 'sm' && styles.itemSm,
    size === 'md' && styles.itemMd,
    size === 'lg' && styles.itemLg,
  ];

  const titleStyle: TextStyle[] = [
    styles.title,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'outline' && styles.outlineText,
    variant === 'ghost' && styles.ghostText,
    variant === 'danger' && styles.dangerText,
    size === 'sm' && styles.titleSm,
    size === 'md' && styles.titleMd,
    size === 'lg' && styles.titleLg,
  ];

  const subtitleStyle: TextStyle[] = [
    styles.subtitle,
    variant === 'primary' && styles.primarySubtext,
    variant === 'secondary' && styles.secondarySubtext,
    variant === 'outline' && styles.outlineSubtext,
    variant === 'ghost' && styles.ghostSubtext,
    variant === 'danger' && styles.dangerSubtext,
    size === 'sm' && styles.subtitleSm,
    size === 'md' && styles.subtitleMd,
    size === 'lg' && styles.subtitleLg,
  ];

  const renderItem: ListRenderItem<ListItem> = ({ item }) => (
    <View
      style={itemStyle}
      accessibilityRole="text"
      accessibilityLabel={`${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}`}
    >
      <Text style={titleStyle}>{item.title}</Text>
      {item.subtitle && <Text style={subtitleStyle}>{item.subtitle}</Text>}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  return (
    <View style={containerStyle}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={!disabled}
        accessibilityLabel="List"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 44,
  },
  primaryContainer: {
    backgroundColor: '#3B82F6',
  },
  secondaryContainer: {
    backgroundColor: '#6B7280',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  item: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemSm: {
    paddingVertical: 8,
    minHeight: 44,
  },
  itemMd: {
    paddingVertical: 12,
    minHeight: 44,
  },
  itemLg: {
    paddingVertical: 16,
    minHeight: 44,
  },
  title: {
    fontWeight: '600',
  },
  titleSm: {
    fontSize: 14,
  },
  titleMd: {
    fontSize: 16,
  },
  titleLg: {
    fontSize: 18,
  },
  subtitle: {
    marginTop: 4,
  },
  subtitleSm: {
    fontSize: 12,
  },
  subtitleMd: {
    fontSize: 14,
  },
  subtitleLg: {
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  primarySubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  secondarySubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  outlineText: {
    color: '#3B82F6',
  },
  outlineSubtext: {
    color: '#6B7280',
  },
  ghostText: {
    color: '#1F2937',
  },
  ghostSubtext: {
    color: '#6B7280',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  dangerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

export { List };
export default memo(List);
