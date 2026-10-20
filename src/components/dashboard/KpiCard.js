import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * KpiCard: Bento Grid KPI Metric Card (21st.dev inspired pattern)
 * 1px fine border, subtle inner tint, status breathing dot, 22px 900-weight typography.
 */
export const KpiCard = ({
  title,
  value,
  unit,
  badgeText,
  badgeVariant = 'success', // 'success' | 'warning' | 'critical' | 'purple' | 'primary'
  statusDotColor,
  icon,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      speed: 35,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const getBadgeColors = () => {
    switch (badgeVariant) {
      case 'critical':
        return { bg: colors.critical + '1A', text: colors.critical, border: colors.critical + '40' };
      case 'warning':
        return { bg: colors.warning + '1A', text: colors.warning, border: colors.warning + '40' };
      case 'purple':
        return { bg: colors.purple + '1A', text: colors.purple, border: colors.purple + '40' };
      case 'primary':
        return { bg: colors.primary + '1A', text: colors.primary, border: colors.primary + '40' };
      case 'success':
      default:
        return { bg: colors.success + '1A', text: colors.success, border: colors.success + '40' };
    }
  };

  const badgeStyle = getBadgeColors();
  const dotColor = statusDotColor || badgeStyle.text;

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colors.card : colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        {/* Row 1: Status Dot + Label + Icon */}
        <View style={styles.topRow}>
          <View style={styles.titleWithDot}>
            <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {title}
            </Text>
          </View>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>

        {/* Row 2: Metric Value (22px Black 900) */}
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.valueText,
              { color: badgeVariant === 'critical' ? colors.critical : colors.textPrimary },
            ]}
          >
            {value}
          </Text>
          {unit && (
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>
              {' '}{unit}
            </Text>
          )}
        </View>

        {/* Row 3: Sub-badge performance */}
        {badgeText && (
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: badgeStyle.bg,
                borderColor: badgeStyle.border,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
              {badgeText}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '48.5%',
    marginBottom: 10,
  },
  container: {
    padding: 13,
    borderRadius: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  title: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  iconContainer: {
    opacity: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  valueText: {
    fontSize: typography.sizes.kpi,
    lineHeight: typography.lineHeights.kpi,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    marginLeft: 2,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  badgeText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
});

export default KpiCard;
