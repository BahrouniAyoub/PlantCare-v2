import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.primary[600]}
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.label,
              styles[`label_${variant}`],
              styles[`labelSize_${size}`],
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconWrap: {
    marginRight: 4,
  },
  primary: {
    backgroundColor: Colors.primary[600],
  },
  secondary: {
    backgroundColor: Colors.primary[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  label: {
    fontWeight: Typography.weights.semibold,
  },
  label_primary: {
    color: Colors.white,
  },
  label_secondary: {
    color: Colors.primary[700],
  },
  label_outline: {
    color: Colors.primary[600],
  },
  label_ghost: {
    color: Colors.primary[600],
  },
  label_danger: {
    color: Colors.white,
  },
  labelSize_sm: {
    fontSize: Typography.sizes.sm,
  },
  labelSize_md: {
    fontSize: Typography.sizes.base,
  },
  labelSize_lg: {
    fontSize: Typography.sizes.md,
  },
});
