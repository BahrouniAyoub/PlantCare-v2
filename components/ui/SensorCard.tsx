import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface SensorCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  subtitle?: string;
}

export function SensorCard({ icon, label, value, unit, color = Colors.primary[600], subtitle }: SensorCardProps) {
  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color }]}>{unit}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  unit: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    paddingBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
