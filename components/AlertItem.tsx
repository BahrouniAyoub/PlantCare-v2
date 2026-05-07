import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriangleAlert as AlertTriangle, Droplets, Wifi, Info, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Alert, AlertType } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const alertConfig: Record<AlertType, { icon: any; color: string; bg: string }> = {
  dry_soil: { icon: Droplets, color: '#f59e0b', bg: '#fef3c7' },
  overwatered: { icon: Droplets, color: '#3b82f6', bg: '#dbeafe' },
  low_tank: { icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
  device_offline: { icon: Wifi, color: '#6b7280', bg: '#f3f4f6' },
  pump_error: { icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
  info: { icon: Info, color: '#3b82f6', bg: '#dbeafe' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface AlertItemProps {
  alert: Alert;
  onMarkRead: (id: string) => void;
}

export function AlertItem({ alert, onMarkRead }: AlertItemProps) {
  const config = alertConfig[alert.type] ?? alertConfig.info;
  const Icon = config.icon;

  return (
    <View style={[styles.container, alert.is_read && styles.read]}>
      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        <Icon size={18} color={config.color} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, alert.is_read && styles.titleRead]}>{alert.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{alert.message}</Text>
        <View style={styles.footer}>
          <Text style={styles.time}>{timeAgo(alert.created_at)}</Text>
          {alert.plant && (
            <Text style={styles.plant}>{alert.plant.name}</Text>
          )}
        </View>
      </View>
      {!alert.is_read && (
        <TouchableOpacity onPress={() => onMarkRead(alert.id)} style={styles.readBtn}>
          <CheckCircle size={18} color={Colors.primary[500]} />
        </TouchableOpacity>
      )}
      {!alert.is_read && <View style={styles.dot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500],
  },
  read: {
    borderLeftColor: Colors.border,
    opacity: 0.7,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  titleRead: {
    fontWeight: Typography.weights.regular,
    color: Colors.text.secondary,
  },
  message: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 2,
  },
  time: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
  },
  plant: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },
  readBtn: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
