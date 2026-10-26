import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * AchievementMeter: 21st.dev Component Pattern for Live Target vs Actual Calculation
 * Features:
 * - Spring-interpolated progress width as numbers are typed in realtime
 * - Glowing achievement badge (On Target vs Below Target based on Net OK parts)
 * - Industrial shop floor high contrast visual feedback
 * - Strict Net Good Parts Only (ISO 9001:2015) variance & efficiency calculation
 */
export const AchievementMeter = ({ target = 0, actual = 0, ngQuantity = 0 }) => {
  const { colors, isDark } = useTheme();

  const numTarget = Math.max(0, Number(target) || 0);
  const numGross = Math.max(0, Number(actual) || 0);
  const numNg = Math.max(0, Number(ngQuantity) || 0);
  const hasNg = numNg > 0;
  const numNetOk = hasNg ? Math.max(0, numGross - numNg) : numGross;

  const percentage = numTarget > 0 ? (numNetOk / numTarget) * 100 : 0;
  const variance = numNetOk - numTarget;
  const isOnTarget = numTarget > 0 && numNetOk >= numTarget;

  // Spring animated width for bar fill
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Clamp visual bar to maximum 100% (so it doesn't overflow bar track), though text can show >100%
    const cappedPercent = Math.min(Math.max(percentage, 0), 100);
    Animated.spring(widthAnim, {
      toValue: cappedPercent,
      friction: 7,
      tension: 45,
      useNativeDriver: false,
    }).start();
  }, [percentage, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const activeColor = isOnTarget ? colors.success : colors.critical;
  const badgeBg = isOnTarget ? colors.success + '1A' : colors.critical + '1A';
  const badgeBorder = isOnTarget ? colors.success + '50' : colors.critical + '50';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.cardSubtle : colors.cardSubtle,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Header: Title & Achievement Pill Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          {isOnTarget ? (
            <TrendingUp size={15} color={colors.success} style={{ marginRight: 6 }} />
          ) : (
            <TrendingDown size={15} color={colors.critical} style={{ marginRight: 6 }} />
          )}
          <Text style={[styles.titleText, { color: colors.textSecondary }]}>
            {hasNg ? 'TARGET EFISIENSI (NET OK)' : 'PENCAPAIAN TARGET'}
          </Text>
        </View>

        {numTarget > 0 && (
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor: badgeBg,
                borderColor: badgeBorder,
              },
            ]}
          >
            {isOnTarget ? (
              <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
            ) : (
              <AlertTriangle size={12} color={colors.critical} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.badgeText, { color: activeColor }]}>
              {isOnTarget
                ? `ON TARGET (${variance >= 0 ? `+${variance}` : variance})`
                : `BELOW TARGET (${variance})`}
            </Text>
          </View>
        )}
      </View>

      {/* Numerical Stats Row */}
      <View style={styles.numbersRow}>
        <View style={styles.statGroup}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TARGET</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {numTarget.toLocaleString('id-ID')}
            <Text style={[styles.statUnit, { color: colors.textMuted }]}> pcs</Text>
          </Text>
        </View>

        <View style={styles.percentageCenter}>
          <Text style={[styles.percentValue, { color: activeColor }]}>
            {percentage.toFixed(1)}%
          </Text>
          <Text style={[styles.percentSub, { color: colors.textMuted }]}>
            {hasNg ? 'Efisiensi Bersih' : 'Efisiensi'}
          </Text>
        </View>

        <View style={[styles.statGroup, { alignItems: 'flex-end' }]}>
          <Text style={[styles.statLabel, { color: isOnTarget ? colors.success : colors.critical }]}>
            {hasNg ? 'PRODUK OK (BERSIH)' : 'HASIL AKTUAL'}
          </Text>
          <Text style={[styles.statValue, { color: activeColor }]}>
            {numNetOk.toLocaleString('id-ID')}
            <Text style={[styles.statUnit, { color: colors.textMuted }]}> pcs</Text>
          </Text>
        </View>
      </View>

      {/* Industrial Transparency Breakdown: Gross - NG = Net OK (Only shown if NG entered) */}
      {hasNg && (
        <View
          style={[
            styles.breakdownCard,
            {
              backgroundColor: isDark ? colors.background : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.breakdownCol}>
            <Text style={[styles.breakdownSubLabel, { color: colors.textMuted }]}>Gross Cetak</Text>
            <Text style={[styles.breakdownSubVal, { color: colors.textPrimary }]}>
              {numGross.toLocaleString('id-ID')} pcs
            </Text>
          </View>

          <Text style={[styles.breakdownSymbol, { color: colors.textMuted }]}>−</Text>

          <View style={styles.breakdownCol}>
            <Text style={[styles.breakdownSubLabel, { color: colors.critical }]}>Reject (NG)</Text>
            <Text
              style={[
                styles.breakdownSubVal,
                { color: numNg > 0 ? colors.critical : colors.textMuted, fontWeight: '700' },
              ]}
            >
              {numNg.toLocaleString('id-ID')} pcs
            </Text>
          </View>

          <Text style={[styles.breakdownSymbol, { color: colors.textMuted }]}>=</Text>

          <View style={styles.breakdownCol}>
            <Text style={[styles.breakdownSubLabel, { color: isOnTarget ? colors.success : colors.critical }]}>
              Net OK Part
            </Text>
            <Text style={[styles.breakdownSubVal, { color: activeColor, fontWeight: '900' }]}>
              {numNetOk.toLocaleString('id-ID')} pcs
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar Track & Spring Interpolated Fill */}
      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: activeColor,
              width: widthInterpolated,
            },
          ]}
        />
      </View>

      {/* Explanatory subtitle */}
      <Text style={[styles.hintText, { color: colors.textMuted }]}>
        {numTarget === 0
          ? 'Masukkan target dan hasil aktual produksi untuk melihat persentase pencapaian.'
          : isOnTarget
          ? `✓ Output produksi (${numGross.toLocaleString('id-ID')} pcs) telah memenuhi target shift!`
          : `⚠ Kekurangan ${Math.abs(variance).toLocaleString('id-ID')} pcs untuk mencapai target harian line.`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginVertical: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 4,
  },
  titleText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  statGroup: {
    flex: 1,
  },
  percentageCenter: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.cardHeading + 2,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  percentValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  percentSub: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '600',
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  breakdownCol: {
    alignItems: 'center',
  },
  breakdownSubLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  breakdownSubVal: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  breakdownSymbol: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  hintText: {
    fontSize: typography.sizes.micro,
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default AchievementMeter;
