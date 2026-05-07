import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, Droplets, Wifi } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?w=800' }}
        style={styles.bg}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(15,23,42,0.85)', 'rgba(15,23,42,0.98)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Leaf size={28} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>PlantCare Live</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.headline}>Smart plant care,{'\n'}simplified.</Text>
          <Text style={styles.sub}>
            Monitor soil moisture, temperature, and humidity. Water your plants from anywhere with simulated smart devices.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureChip icon={<Droplets size={14} color={Colors.primary[400]} />} label="Live Sensor Data" />
          <FeatureChip icon={<Wifi size={14} color={Colors.primary[400]} />} label="IoT Devices" />
          <FeatureChip icon={<Leaf size={14} color={Colors.primary[400]} />} label="Auto-Watering" />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FeatureChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.chip}>
      {icon}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.secondary[900] },
  bg: {
    position: 'absolute',
    width,
    height: height * 0.6,
    top: 0,
  },
  gradient: {
    position: 'absolute',
    width,
    height,
    top: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  hero: {
    gap: Spacing.sm,
  },
  headline: {
    fontSize: 38,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    lineHeight: 38 * 1.15,
  },
  sub: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: Typography.sizes.base * 1.6,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  actions: {
    gap: Spacing.sm,
  },
  btnPrimary: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnSecondaryText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255,255,255,0.85)',
  },
});
