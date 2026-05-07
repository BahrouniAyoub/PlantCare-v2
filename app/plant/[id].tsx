import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Droplets,
  Thermometer,
  Wind,
  Cpu,
  Zap,
  Trash2,
  Clock,
  TriangleAlert,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { triggerWatering } from '@/services/simulation';
import { Plant, TelemetryReading, IrrigationEvent, Alert as PlantAlert } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SensorCard } from '@/components/ui/SensorCard';
import { HealthBar } from '@/components/ui/HealthBar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

function formatTime(str: string) {
  return new Date(str).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryReading | null>(null);
  const [history, setHistory] = useState<IrrigationEvent[]>([]);
  const [alerts, setAlerts] = useState<PlantAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [watering, setWatering] = useState(false);
  const [autoWater, setAutoWater] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    const [plantRes, telRes, histRes, alertRes] = await Promise.all([
      supabase.from('plants').select('*, device:devices(*)').eq('id', id).maybeSingle(),
      supabase
        .from('telemetry_readings')
        .select('*')
        .eq('plant_id', id)
        .order('created_at', { ascending: false })
        .limit(1),
      supabase
        .from('irrigation_events')
        .select('*')
        .eq('plant_id', id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('alerts')
        .select('*')
        .eq('plant_id', id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const p = plantRes.data as Plant | null;
    setPlant(p);
    setTelemetry((telRes.data ?? [])[0] ?? null);
    setHistory(histRes.data ?? []);
    setAlerts(alertRes.data ?? []);
    if (p?.device) setAutoWater((p.device as any).automation_enabled);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  async function handleWaterNow() {
    if (!plant?.device_id || !user) return;
    setWatering(true);
    try {
      const result = await triggerWatering(
        plant.device_id,
        user.id,
        plant.id,
        'manual',
        telemetry ?? undefined
      );
      if (!result.success) {
        Alert.alert('Cannot Water', result.message);
      } else {
        await fetchAll();
      }
    } finally {
      setWatering(false);
    }
  }

  async function toggleAutoWater(value: boolean) {
    if (!plant?.device_id) return;
    setAutoWater(value);
    await supabase
      .from('devices')
      .update({ automation_enabled: value })
      .eq('id', plant.device_id);
  }

  async function handleDelete() {
    Alert.alert(
      'Delete Plant',
      `Remove "${plant?.name}" from your garden? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('plants').delete().eq('id', id!);
            router.back();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Plant not found.</Text>
        <Button label="Go Back" onPress={() => router.back()} variant="ghost" />
      </View>
    );
  }

  const device = plant.device as any;
  const imageUri = plant.image_url || 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?w=600';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={Colors.primary[500]} />
      }
    >
      {/* Hero Image */}
      <View style={styles.hero}>
        <Image source={{ uri: imageUri }} style={styles.heroImg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroName}>{plant.name}</Text>
          {plant.species ? (
            <Text style={styles.heroSpecies}>{plant.species}</Text>
          ) : null}
          {plant.location ? (
            <Badge label={plant.location} variant="neutral" size="md" />
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        {/* Health Score */}
        <Card>
          <Text style={styles.sectionLabel}>Health Score</Text>
          <HealthBar value={plant.health_score} showLabel />
        </Card>

        {/* Sensor Readings */}
        {telemetry ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Sensor Data</Text>
            <View style={styles.sensorGrid}>
              <SensorCard
                icon={<Droplets size={18} color={Colors.info} />}
                label="Soil Moisture"
                value={String(Math.round(telemetry.soil_moisture))}
                unit="%"
                color={Colors.info}
              />
              <SensorCard
                icon={<Thermometer size={18} color={Colors.accent[500]} />}
                label="Temperature"
                value={String(telemetry.temperature.toFixed(1))}
                unit="°C"
                color={Colors.accent[500]}
              />
              <SensorCard
                icon={<Wind size={18} color={Colors.secondary[500]} />}
                label="Humidity"
                value={String(Math.round(telemetry.humidity))}
                unit="%"
                color={Colors.secondary[500]}
              />
              <SensorCard
                icon={<Droplets size={18} color={Colors.primary[500]} />}
                label="Tank Level"
                value={String(Math.round(telemetry.tank_level))}
                unit="%"
                color={Colors.primary[500]}
              />
            </View>
          </View>
        ) : (
          <Card style={styles.noTelCard}>
            <Text style={styles.noTelText}>No sensor data yet. Simulation starts in a few seconds.</Text>
          </Card>
        )}

        {/* Device Status + Actions */}
        {device && (
          <Card style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIconWrap}>
                <Cpu size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <View style={styles.deviceStatusRow}>
                  <View style={[styles.statusDot, { backgroundColor: device.status === 'online' ? Colors.success : Colors.error }]} />
                  <Text style={styles.deviceStatus}>{device.status}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push(`/device/${device.id}`)} style={styles.deviceBtn}>
                <Text style={styles.deviceBtnText}>View</Text>
              </TouchableOpacity>
            </View>

            {telemetry && (
              <View style={styles.pumpRow}>
                <Zap size={14} color={telemetry.pump_on ? Colors.warning : Colors.text.muted} />
                <Text style={styles.pumpText}>
                  Pump: {telemetry.pump_on ? 'Running' : 'Idle'}
                </Text>
              </View>
            )}

            {/* Water Now */}
            <Button
              label={watering ? 'Watering...' : 'Water Now'}
              onPress={handleWaterNow}
              loading={watering}
              fullWidth
              icon={<Droplets size={16} color={Colors.white} />}
              style={styles.waterBtn}
            />

            {/* Auto-watering toggle */}
            <View style={styles.autoRow}>
              <View style={styles.autoLeft}>
                <Text style={styles.autoTitle}>Auto-Watering</Text>
                <Text style={styles.autoSub}>Waters when moisture drops below {device.min_moisture}%</Text>
              </View>
              <Switch
                value={autoWater}
                onValueChange={toggleAutoWater}
                trackColor={{ false: Colors.border, true: Colors.primary[400] }}
                thumbColor={autoWater ? Colors.primary[600] : Colors.secondary[300]}
              />
            </View>
          </Card>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertRow}>
                <TriangleAlert size={14} color={Colors.warning} />
                <Text style={styles.alertText}>{alert.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Watering History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Waterings</Text>
            {history.map((ev) => (
              <View key={ev.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Clock size={14} color={Colors.primary[600]} />
                </View>
                <View style={styles.historyBody}>
                  <Text style={styles.historyTitle}>
                    {ev.trigger_type === 'manual' ? 'Manual' : 'Auto'} Watering
                  </Text>
                  <Text style={styles.historyTime}>{formatTime(ev.created_at)}</Text>
                </View>
                <Badge label={ev.success ? 'Done' : 'Failed'} variant={ev.success ? 'success' : 'error'} />
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {plant.notes ? (
          <Card>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notes}>{plant.notes}</Text>
          </Card>
        ) : null}

        {/* Delete Button */}
        <Button
          label="Delete Plant"
          onPress={handleDelete}
          variant="danger"
          fullWidth
          style={styles.deleteBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFound: { fontSize: Typography.sizes.lg, color: Colors.text.muted },
  hero: { position: 'relative', height: 280 },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    gap: 6,
  },
  heroName: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  heroSpecies: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  body: { padding: Spacing.lg, gap: Spacing.lg },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  noTelCard: {
    backgroundColor: Colors.secondary[50],
    alignItems: 'center',
  },
  noTelText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  deviceCard: { gap: Spacing.md },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: { flex: 1 },
  deviceName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  deviceStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  deviceStatus: { fontSize: Typography.sizes.xs, color: Colors.text.muted, textTransform: 'capitalize' },
  deviceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
  },
  deviceBtnText: { fontSize: Typography.sizes.sm, color: Colors.primary[600], fontWeight: Typography.weights.medium },
  pumpRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pumpText: { fontSize: Typography.sizes.sm, color: Colors.text.secondary },
  waterBtn: { marginTop: 4 },
  autoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  autoLeft: { flex: 1 },
  autoTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.medium, color: Colors.text.primary },
  autoSub: { fontSize: Typography.sizes.xs, color: Colors.text.muted, marginTop: 2 },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#fffbeb',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  alertText: { fontSize: Typography.sizes.sm, color: '#92400e', flex: 1 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBody: { flex: 1 },
  historyTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.text.primary },
  historyTime: { fontSize: Typography.sizes.xs, color: Colors.text.muted, marginTop: 2 },
  notes: { fontSize: Typography.sizes.base, color: Colors.text.secondary, lineHeight: Typography.sizes.base * 1.6 },
  deleteBtn: { marginTop: Spacing.sm },
});
