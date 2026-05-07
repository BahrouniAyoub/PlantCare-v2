import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({ label, error, icon, isPassword, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, style as any]}
          placeholderTextColor={Colors.text.muted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.iconRight}
          >
            {showPassword ? (
              <EyeOff size={18} color={Colors.text.muted} />
            ) : (
              <Eye size={18} color={Colors.text.muted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.sizes.base,
    color: Colors.text.primary,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  error: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
  },
});
