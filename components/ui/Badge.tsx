import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.primary[100], text: Colors.primary[700] },
  warning: { bg: '#fef3c7', text: '#92400e' },
  error: { bg: '#fee2e2', text: '#991b1b' },
  info: { bg: '#dbeafe', text: '#1e40af' },
  neutral: { bg: Colors.secondary[100], text: Colors.secondary[600] },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.base, { backgroundColor: colors.bg }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color: colors.text }, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  textMd: {
    fontSize: Typography.sizes.sm,
  },
});
