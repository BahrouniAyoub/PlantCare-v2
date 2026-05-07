import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Cpu, Droplets, Thermometer, Wind, RotateCcw, Wifi, WifiOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Device, TelemetryReading, SimulationScenario } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SensorCard } from '@/components/ui/SensorCard';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const SCENARIOS: { key: SimulationScenario; label: string; desc: string; color: string }[] = [
  { key: 'normal', label: 'Normal', desc: 'Stable sensor values', color: Colors.primary[500] },
  { key: 'dry_plant', label: 'Dry Plant', desc: 'Moisture drops quickly', color: Colors.warning },
  { key: 'overwatered', label: 'Overwatered', desc: 'Moisture stays high', color: Colors.info },
  { key: 'hot_day', label: 'Hot Day', desc: 'High temp + fast drying', color: Colors.accent[500] },
  { key: 'low_tank', label: 'Low Tank', desc: 'Tank drains fast', color: Colors.error },
  { key: 'offline', label: 'Offline Device', desc: 'No updates, status offline', color: Colors.secondary[500] },
];

function formatRelative(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function DeviceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [device, setDevice] = useState<Device | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const [devRes, telRes] = await Promise.all([
      supabase.from('devices').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('telemetry_readings')
        .select('*')
        .eq('device_id', id)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);
    setDevice(devRes.data);
    setTelemetry((telRes.data ?? [])[0] ?? null);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function changeScenario(scenario: SimulationScenario) {
    if (!device) return;
    const newStatus = scenario === 'offline' ? 'offline' : 'online';
    await supabase
      .from('devices')
      .update({ scenario, status: newStatus })
      .eq('id', device.id);
    setDevice((d) => d ? { ...d, scenario, status: newStatus } : d);
  }

  async function resetSimulation() {
    if (!device) return;
    setResetting(true);
    try {
      // Reset to normal scenario and insert fresh baseline telemetry
      await supabase.from('devices').update({ scenario: 'normal', status: 'online' }).eq('id', device.id);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('telemetry_readings').insert({
          owner_id: user.id,
          device_id: device.id,
          plant_id: device.plant_id,
          soil_moisture: 55,
          temperature: 22,
          humidity: 60,
          tank_level: 95,
          pump_on: false,
        });
      }

      setDevice((d) => d ? { ...d, scenario: 'normal', status: 'online' } : d);
      await fetchData();
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Device not found.</Text>
        <Button label="Go Back" onPress={() => router.back()} variant="ghost" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={Colors.primary[500]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{device.name}</Text>
          <Text style={styles.subtitle}>Simulated IoT Device</Text>
        </View>
        <View style={styles.statusBadge}>
          {device.status === 'online'
            ? <Wifi size={14} color={Colors.success} />
            : <WifiOff size={14} color={Colors.error} />}
          <Text style={[styles.statusText, { color: device.status === 'online' ? Colors.success : Colors.error }]}>
            {device.status}
          </Text>
        </View>
      </View>

      {/* Device Info Card */}
      <Card variant="elevated" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <Cpu size={24} color={Colors.primary[600]} />
          </View>
          <View style={styles.infoBody}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>Simulated Device</Text>
          </View>
          <View style={styles.infoBody}>
            <Text style={styles.infoLabel}>Scenario</Text>
            <Badge
              label={SCENARIOS.find(s => s.key === device.scenario)?.label ?? device.scenario}
              variant={device.scenario === 'offline' ? 'neutral' : 'success'}
              size="md"
            />
          </View>
        </View>
        {telemetry && (
          <Text style={styles.lastSeen}>
            Last updated {formatRelative(telemetry.created_at)}
          </Text>
        )}
      </Card>

      {/* Live Sensor Readings */}
      {telemetry ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Sensor Readings</Text>
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
        <Card style={styles.noDataCard}>
          <Text style={styles.noDataText}>
            {device.status === 'offline' ? 'Device is offline. Switch scenario to go online.' : 'No readings yet...'}
          </Text>
        </Card>
      )}

      {/* Scenario Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulation Scenario</Text>
        <Text style={styles.sectionSub}>
          Change the scenario to simulate different plant conditions in real-time.
        </Text>
        <View style={styles.scenarioGrid}>
          {SCENARIOS.map((scenario) => (
            <TouchableOpacity
              key={scenario.key}
              onPress={() => changeScenario(scenario.key)}
              style={[
                styles.scenarioCard,
                device.scenario === scenario.key && styles.scenarioCardActive,
                device.scenario === scenario.key && { borderColor: scenario.color },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.scenarioDot, { backgroundColor: scenario.color }]} />
              <Text style={[
                styles.scenarioLabel,
                device.scenario === scenario.key && { color: scenario.color },
              ]}>
                {scenario.label}
              </Text>
              <Text style={styles.scenarioDesc}>{scenario.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reset Button */}
      <Button
        label="Reset Simulation"
        onPress={resetSimulation}
        loading={resetting}
        variant="outline"
        fullWidth
        icon={<RotateCcw size={16} color={Colors.primary[600]} />}
      />

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFound: { fontSize: Typography.sizes.lg, color: Colors.text.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerCenter: { flex: 1 },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...Shadows.sm,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
  },
  infoCard: { gap: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: { flex: 1, gap: 4 },
  infoLabel: { fontSize: Typography.sizes.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.medium, color: Colors.text.primary },
  lastSeen: { fontSize: Typography.sizes.xs, color: Colors.text.muted },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  sectionSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
    marginTop: -Spacing.sm,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  noDataCard: {
    alignItems: 'center',
    backgroundColor: Colors.secondary[50],
  },
  noDataText: { fontSize: Typography.sizes.sm, color: Colors.text.muted, textAlign: 'center' },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  scenarioCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  scenarioCardActive: {
    backgroundColor: Colors.primary[50],
  },
  scenarioDot: { width: 10, height: 10, borderRadius: 5 },
  scenarioLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  scenarioDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    lineHeight: Typography.sizes.xs * 1.5,
  },
  bottomPad: { height: Spacing.xl },
});
