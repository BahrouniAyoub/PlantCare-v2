import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Leaf,
  Moon,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const [notifications, setNotifications] = useState(true);

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name ?? 'Plant Lover'}</Text>
          <Text style={styles.profileEmail}>{profile?.email ?? ''}</Text>
        </View>
      </View>

      {/* Account Section */}
      <SettingsSection title="Account">
        <SettingsRow
          icon={<User size={18} color={Colors.primary[600]} />}
          label="Profile"
          iconBg={Colors.primary[50]}
          onPress={() => {}}
        />
        <SettingsRow
          icon={<Shield size={18} color={Colors.info} />}
          label="Privacy & Security"
          iconBg="#eff6ff"
          onPress={() => {}}
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences">
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIcon, { backgroundColor: '#fef3c7' }]}>
              <Bell size={18} color={Colors.warning} />
            </View>
            <Text style={styles.rowLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.border, true: Colors.primary[400] }}
            thumbColor={notifications ? Colors.primary[600] : Colors.secondary[300]}
          />
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.secondary[100] }]}>
              <Moon size={18} color={Colors.secondary[600]} />
            </View>
            <Text style={styles.rowLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: Colors.border, true: Colors.primary[400] }}
            thumbColor={Colors.secondary[300]}
          />
        </View>
      </SettingsSection>

      {/* App Section */}
      <SettingsSection title="App">
        <SettingsRow
          icon={<Info size={18} color={Colors.secondary[500]} />}
          label="About PlantCare Live"
          iconBg={Colors.secondary[100]}
          onPress={() => {}}
          value="v1.0.0"
        />
        <SettingsRow
          icon={<Leaf size={18} color={Colors.primary[600]} />}
          label="How Simulation Works"
          iconBg={Colors.primary[50]}
          onPress={() => {}}
        />
      </SettingsSection>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
        <LogOut size={18} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        PlantCare Live • Made with care for your plants
      </Text>
    </ScrollView>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  iconBg,
  onPress,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  onPress: () => void;
  value?: string;
}) {
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.rowLeft}>
          <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          <ChevronRight size={16} color={Colors.text.muted} />
        </View>
      </TouchableOpacity>
      <View style={styles.rowDivider} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  pageTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  profileInfo: { gap: 4 },
  profileName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  profileEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#fee2e2',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  signOutText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.error,
  },
  footer: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
