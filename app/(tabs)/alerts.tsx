import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Alert } from '@/types';
import { AlertItem } from '@/components/AlertItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function AlertsScreen() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('alerts')
        .select('*, plant:plants(name)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setAlerts(data ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('owner_id', user.id)
      .eq('is_read', false);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  }, [user]);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <CheckCheck size={16} color={Colors.primary[600]} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary[500]} style={styles.loader} />
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} color={Colors.primary[400]} />}
          title="No alerts"
          subtitle="Your plants are doing great! Alerts will appear here when they need attention."
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertItem alert={item} onMarkRead={markRead} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAlerts(); }}
              tintColor={Colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.primary[50],
    borderRadius: 8,
  },
  markAllText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary[600],
    fontWeight: Typography.weights.medium,
  },
  loader: { flex: 1 },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  separator: { height: Spacing.sm },
});
