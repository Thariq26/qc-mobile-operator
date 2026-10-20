import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * SpringButton: Tactile Spring Press Micro-Interaction
 * Scales to 0.96 on pressIn, springs back to 1.0 on pressOut with damping.
 * Glove-friendly: Minimum 48px height touch target.
 */
export const SpringButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'critical' | 'outline' | 'gradient'
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
  gradientColors,
  size = 'default', // 'small' | 'default' | 'large'
  children,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const isGradient = variant === 'gradient';

  // Sizing styles
  const sizeStyles = {
    small: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    default: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
    large: { minHeight: 54, paddingHorizontal: 24, paddingVertical: 15, borderRadius: 16 },
  }[size] || { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 };

  // Variant styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          backgroundColor: colors.critical,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          borderWidth: 1.5,
          textColor: colors.textPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.cardSubtle,
          borderColor: colors.border,
          borderWidth: 1,
          textColor: colors.textPrimary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: 'transparent',
          textColor: '#FFFFFF',
        };
    }
  };

  const vStyles = getVariantStyles();
  const defaultGradient = gradientColors || ['#2563EB', '#6366F1', '#7C3AED'];

  const content = (
    <View style={styles.innerContent}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary : '#FFFFFF'}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          {title ? (
            <Text
              style={[
                styles.label,
                { color: vStyles.textColor },
                variant === 'gradient' && { color: '#FFFFFF' },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            children
          )}
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.baseButton,
          sizeStyles,
          !isGradient && {
            backgroundColor: vStyles.backgroundColor,
            borderColor: vStyles.borderColor,
            borderWidth: vStyles.borderWidth || 0,
          },
          (disabled || loading) && styles.disabled,
          pressed && !disabled && !loading && { opacity: 0.9 },
        ]}
      >
        {isGradient ? (
          <LinearGradient
            colors={defaultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientFill, sizeStyles]}
          >
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientFill: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  spinner: {
    marginHorizontal: 12,
  },
  disabled: {
    opacity: 0.55,
  },
});

export default SpringButton;
