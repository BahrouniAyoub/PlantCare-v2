import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * 1.5,
  },
  action: {
    marginTop: Spacing.md,
  },
});
