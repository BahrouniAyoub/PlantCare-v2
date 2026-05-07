import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';

interface HealthBarProps {
  value: number; // 0-100
  label?: string;
  showLabel?: boolean;
  height?: number;
  color?: string;
}

function getHealthColor(value: number) {
  if (value >= 70) return Colors.primary[500];
  if (value >= 40) return Colors.warning;
  return Colors.error;
}

export function HealthBar({ value, label, showLabel = true, height = 8, color }: HealthBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const barColor = color ?? getHealthColor(clampedValue);

  return (
    <View style={styles.container}>
      {(label || showLabel) && (
        <View style={styles.row}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showLabel && <Text style={[styles.value, { color: barColor }]}>{clampedValue}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clampedValue}%` as any, backgroundColor: barColor, height },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  value: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  track: {
    backgroundColor: Colors.secondary[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
