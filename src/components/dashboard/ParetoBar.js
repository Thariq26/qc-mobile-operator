import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * ParetoBar: Horizontal Progress Bar with Spring Width Interpolation
 * Animates smoothly between Daily, Weekly, and Monthly tab switches.
 */
export const ParetoBar = ({
  rank = 1,
  defectName,
  process,
  quantity,
  percentage,
  severity = 'critical', // 'critical' | 'warning'
}) => {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: Math.min(percentage, 100),
      friction: 8,
      tension: 40,
      useNativeDriver: false, // width requires layout calculation
    }).start();
  }, [percentage, widthAnim]);

  const getBarColor = () => {
    if (rank === 1) return colors.critical;
    if (rank === 2) return '#F97316'; // Vivid Orange
    if (rank === 3) return colors.warning; // Amber
    if (rank === 4) return '#EAB308'; // Yellow
    return colors.primary; // Industrial Cobalt
  };

  const barColor = getBarColor();
  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Top Details Row */}
      <View style={styles.detailRow}>
        <View style={styles.leftLabelGroup}>
          <View style={[styles.rankBadge, { backgroundColor: barColor + '20', borderColor: barColor + '50' }]}>
            <Text style={[styles.rankText, { color: barColor }]}>#{rank}</Text>
          </View>
          <Text style={[styles.defectTitle, { color: colors.textPrimary }]}>
            {defectName}
          </Text>
          {process && (
            <Text style={[styles.processTag, { color: colors.textSecondary }]}>
              • {process}
            </Text>
          )}
        </View>

        {/* Right Qty & Percentage */}
        <View style={styles.rightStatGroup}>
          <Text style={[styles.qtyText, { color: colors.textPrimary }]}>
            {quantity} pcs
          </Text>
          <Text style={[styles.percentageText, { color: barColor }]}>
            ({percentage}%)
          </Text>
        </View>
      </View>

      {/* Animated Width Bar Track */}
      <View style={[styles.track, { backgroundColor: colors.cardSubtle }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthInterpolated,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  leftLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  rankText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '900',
  },
  defectTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
  },
  processTag: {
    fontSize: typography.sizes.caption,
    marginLeft: 6,
  },
  rightStatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    marginRight: 4,
  },
  percentageText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default ParetoBar;
