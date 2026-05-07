import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Leaf } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrors({ general: e.message ?? 'Login failed. Please try again.' });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Leaf size={32} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>PlantCare Live</Text>
          <Text style={styles.tagline}>Welcome back</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>

          <View style={styles.form}>
            {errors.general && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              icon={<Mail size={16} color={Colors.text.muted} />}
            />

            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={errors.password}
              icon={<Lock size={16} color={Colors.text.muted} />}
            />

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitBtn}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backText}>Back to home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  tagline: {
    fontSize: Typography.sizes.base,
    color: Colors.text.muted,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text.muted,
    marginTop: -Spacing.sm,
  },
  form: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: Typography.sizes.base,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontSize: Typography.sizes.base,
    color: Colors.primary[600],
    fontWeight: Typography.weights.semibold,
  },
  backLink: {
    alignItems: 'center',
  },
  backText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.muted,
  },
});
