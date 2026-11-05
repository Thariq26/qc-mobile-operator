import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, isCompactScreen } from '../../theme/responsive';

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
            <Text
              style={[styles.title, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>

        {/* Row 2: Metric Value (Consistent textPrimary for clean readability) */}
        <View style={styles.valueRow}>
          <Text
            style={[
              styles.valueText,
              { color: colors.textPrimary },
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
    marginBottom: spacing(8),
  },
  container: {
    padding: spacing(10),
    borderRadius: 12,
    minHeight: isCompactScreen ? 82 : 88,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  title: {
    flex: 1,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  iconContainer: {
    opacity: 0.9,
    marginLeft: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  valueText: {
    fontSize: isCompactScreen ? 19 : 21,
    lineHeight: isCompactScreen ? 23 : 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 1,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});

export default KpiCard;
