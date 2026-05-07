import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Leaf, Bell, Wifi, WifiOff, TriangleAlert } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface DashboardStats {
  totalPlants: number;
  devicesOnline: number;
  devicesOffline: number;
  unreadAlerts: number;
  healthyPlants: number;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const [plantsRes, devicesRes, alertsRes] = await Promise.all([
        supabase.from('plants').select('id, health_score').eq('owner_id', user.id),
        supabase.from('devices').select('id, status').eq('owner_id', user.id),
        supabase.from('alerts').select('id').eq('owner_id', user.id).eq('is_read', false),
      ]);

      const plants = plantsRes.data ?? [];
      const devices = devicesRes.data ?? [];
      const alerts = alertsRes.data ?? [];

      setStats({
        totalPlants: plants.length,
        devicesOnline: devices.filter((d) => d.status === 'online').length,
        devicesOffline: devices.filter((d) => d.status === 'offline').length,
        unreadAlerts: alerts.length,
        healthyPlants: plants.filter((p) => p.health_score >= 70).length,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  const firstName = profile?.name?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[500]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName} 🌿</Text>
        </View>
        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => router.push('/(tabs)/alerts')}
        >
          <Bell size={20} color={Colors.text.secondary} />
          {stats && stats.unreadAlerts > 0 && (
            <View style={styles.alertDot}>
              <Text style={styles.alertDotText}>
                {stats.unreadAlerts > 9 ? '9+' : stats.unreadAlerts}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Leaf size={32} color={Colors.white} />
          <View>
            <Text style={styles.bannerTitle}>Plant Garden</Text>
            <Text style={styles.bannerSub}>
              {loading ? 'Loading...' : `${stats?.totalPlants ?? 0} plants • ${stats?.devicesOnline ?? 0} devices active`}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary[500]} style={styles.loader} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Plants"
            value={String(stats?.totalPlants ?? 0)}
            icon={<Leaf size={20} color={Colors.primary[600]} />}
            color={Colors.primary[50]}
            onPress={() => router.push('/(tabs)/plants')}
          />
          <StatCard
            label="Healthy"
            value={String(stats?.healthyPlants ?? 0)}
            icon={<Leaf size={20} color={Colors.success} />}
            color='#f0fdf4'
            onPress={() => router.push('/(tabs)/plants')}
          />
          <StatCard
            label="Online"
            value={String(stats?.devicesOnline ?? 0)}
            icon={<Wifi size={20} color={Colors.info} />}
            color='#eff6ff'
            onPress={() => router.push('/(tabs)/plants')}
          />
          <StatCard
            label="Alerts"
            value={String(stats?.unreadAlerts ?? 0)}
            icon={<TriangleAlert size={20} color={Colors.warning} />}
            color='#fffbeb'
            onPress={() => router.push('/(tabs)/alerts')}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            label="Add Plant"
            icon={<Plus size={22} color={Colors.white} />}
            color={Colors.primary[600]}
            onPress={() => router.push('/add-plant')}
          />
          <QuickAction
            label="My Plants"
            icon={<Leaf size={22} color={Colors.white} />}
            color={Colors.secondary[700]}
            onPress={() => router.push('/(tabs)/plants')}
          />
          <QuickAction
            label="Alerts"
            icon={<Bell size={22} color={Colors.white} />}
            color={Colors.accent[500]}
            onPress={() => router.push('/(tabs)/alerts')}
          />
        </View>
      </View>

      {/* Tip Card */}
      <Card style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Text style={styles.tipEmoji}>💡</Text>
        </View>
        <View style={styles.tipBody}>
          <Text style={styles.tipTitle}>Plant Care Tip</Text>
          <Text style={styles.tipText}>
            Most indoor plants prefer soil moisture between 40–70%. Check your plants regularly and use auto-watering to keep them happy.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  onPress,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.quickAction}>
      <View style={[styles.qaIcon, { backgroundColor: color }]}>{icon}</View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.base,
    color: Colors.text.muted,
  },
  name: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  alertBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  alertDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  alertDotText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  banner: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary[600],
    padding: Spacing.lg,
    ...Shadows.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bannerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  bannerSub: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  loader: { marginVertical: Spacing.xl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    fontWeight: Typography.weights.medium,
  },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  qaLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipEmoji: { fontSize: 20 },
  tipBody: { flex: 1, gap: 4 },
  tipTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary[800],
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[700],
    lineHeight: Typography.sizes.sm * 1.6,
  },
});
