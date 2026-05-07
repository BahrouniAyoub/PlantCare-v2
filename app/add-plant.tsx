import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Leaf, MapPin, FileText, Cpu } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const PLANT_IMAGES = [
  'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?w=400',
  'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?w=400',
  'https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?w=400',
  'https://images.pexels.com/photos/1055379/pexels-photo-1055379.jpeg?w=400',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?w=400',
  'https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg?w=400',
];

export default function AddPlantScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [createDevice, setCreateDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Plant name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      // Create the plant
      const { data: plant, error: plantErr } = await supabase
        .from('plants')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          species: species.trim(),
          location: location.trim(),
          notes: notes.trim(),
          image_url: PLANT_IMAGES[selectedImage],
          health_score: 85,
        })
        .select()
        .single();

      if (plantErr) throw plantErr;

      let deviceId: string | null = null;

      if (createDevice) {
        const { data: device, error: devErr } = await supabase
          .from('devices')
          .insert({
            owner_id: user.id,
            plant_id: plant.id,
            name: `${name.trim()} Sensor`,
            type: 'simulated',
            status: 'online',
            scenario: 'normal',
            automation_enabled: false,
          })
          .select()
          .single();

        if (devErr) throw devErr;
        deviceId = device.id;

        // Link device to plant
        await supabase.from('plants').update({ device_id: deviceId }).eq('id', plant.id);

        // Seed initial telemetry
        await supabase.from('telemetry_readings').insert({
          owner_id: user.id,
          device_id: device.id,
          plant_id: plant.id,
          soil_moisture: 55,
          temperature: 22,
          humidity: 60,
          tank_level: 95,
          pump_on: false,
        });
      }

      router.back();
      setTimeout(() => router.push(`/plant/${plant.id}`), 200);
    } catch (e: any) {
      setErrors({ general: e.message ?? 'Failed to add plant.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add Plant</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        {/* Image Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose a Photo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
            {PLANT_IMAGES.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImage(idx)}
                style={[styles.imageThumb, idx === selectedImage && styles.imageThumbSelected]}
                activeOpacity={0.8}
              >
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Plant Details</Text>
          <View style={styles.formFields}>
            <Input
              label="Plant name *"
              placeholder="e.g. My Monstera"
              value={name}
              onChangeText={setName}
              error={errors.name}
              icon={<Leaf size={16} color={Colors.text.muted} />}
              autoCapitalize="words"
            />
            <Input
              label="Species"
              placeholder="e.g. Monstera deliciosa"
              value={species}
              onChangeText={setSpecies}
              icon={<Leaf size={16} color={Colors.text.muted} />}
              autoCapitalize="words"
            />
            <Input
              label="Location"
              placeholder="e.g. Living Room, Balcony"
              value={location}
              onChangeText={setLocation}
              icon={<MapPin size={16} color={Colors.text.muted} />}
              autoCapitalize="words"
            />
            <Input
              label="Notes"
              placeholder="Anything to remember about this plant..."
              value={notes}
              onChangeText={setNotes}
              icon={<FileText size={16} color={Colors.text.muted} />}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Device Toggle */}
        <Card style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceIconWrap}>
              <Cpu size={20} color={Colors.primary[600]} />
            </View>
            <View style={styles.deviceText}>
              <Text style={styles.deviceTitle}>Create Smart Device</Text>
              <Text style={styles.deviceSub}>
                Attach a simulated IoT sensor to monitor this plant
              </Text>
            </View>
            <Switch
              value={createDevice}
              onValueChange={setCreateDevice}
              trackColor={{ false: Colors.border, true: Colors.primary[400] }}
              thumbColor={createDevice ? Colors.primary[600] : Colors.secondary[300]}
            />
          </View>
          {createDevice && (
            <View style={styles.deviceNote}>
              <Text style={styles.deviceNoteText}>
                A simulated sensor will be created that monitors soil moisture, temperature, humidity, and tank level every 5 seconds.
              </Text>
            </View>
          )}
        </Card>

        <Button
          label="Add Plant"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        />

        <View style={styles.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: Typography.sizes.sm,
  },
  section: { gap: Spacing.sm },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  imageRow: { gap: Spacing.sm, paddingVertical: 4 },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageThumbSelected: {
    borderColor: Colors.primary[500],
  },
  thumbImg: { width: '100%', height: '100%' },
  formFields: { gap: Spacing.md },
  deviceCard: {
    gap: Spacing.sm,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceText: { flex: 1 },
  deviceTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  deviceSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  deviceNote: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  deviceNoteText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary[700],
    lineHeight: Typography.sizes.xs * 1.6,
  },
  bottomPad: { height: Spacing.xl },
});
