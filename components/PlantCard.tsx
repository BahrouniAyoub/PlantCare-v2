import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Droplets, Thermometer, Wifi, WifiOff } from 'lucide-react-native';
import { Plant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HealthBar } from '@/components/ui/HealthBar';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const PLANT_IMAGES = [
  'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?w=300',
  'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?w=300',
  'https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?w=300',
  'https://images.pexels.com/photos/1055379/pexels-photo-1055379.jpeg?w=300',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?w=300',
];

function getPlantImage(plant: Plant) {
  if (plant.image_url) return { uri: plant.image_url };
  // Deterministic fallback from Pexels
  const idx = plant.name.charCodeAt(0) % PLANT_IMAGES.length;
  return { uri: PLANT_IMAGES[idx] };
}

function getMoistureStatus(moisture: number | undefined) {
  if (moisture === undefined) return { label: 'Unknown', variant: 'neutral' as const };
  if (moisture < 25) return { label: 'Too Dry', variant: 'error' as const };
  if (moisture > 80) return { label: 'Overwatered', variant: 'warning' as const };
  return { label: 'Good', variant: 'success' as const };
}

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export function PlantCard({ plant, onPress }: PlantCardProps) {
  const telemetry = plant.latest_telemetry;
  const device = plant.device;
  const moisture = getMoistureStatus(telemetry?.soil_moisture);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card variant="elevated" style={styles.card}>
        <Image source={getPlantImage(plant)} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name} numberOfLines={1}>{plant.name}</Text>
              <Text style={styles.species} numberOfLines={1}>{plant.species || 'Unknown species'}</Text>
            </View>
            {device && (
              device.status === 'online'
                ? <Wifi size={16} color={Colors.primary[500]} />
                : <WifiOff size={16} color={Colors.text.muted} />
            )}
          </View>

          <HealthBar value={plant.health_score} label="Health" height={6} />

          <View style={styles.footer}>
            {telemetry && (
              <View style={styles.metricRow}>
                <Droplets size={13} color={Colors.info} />
                <Text style={styles.metric}>{telemetry.soil_moisture.toFixed(0)}%</Text>
                <Thermometer size={13} color={Colors.accent[500]} />
                <Text style={styles.metric}>{telemetry.temperature.toFixed(1)}°C</Text>
              </View>
            )}
            <Badge label={moisture.label} variant={moisture.variant} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  species: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metric: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginRight: 4,
  },
});
