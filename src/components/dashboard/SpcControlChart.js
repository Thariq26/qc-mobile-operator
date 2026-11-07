import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Line,
  Circle,
  Path,
  Rect,
  Text as SvgText,
  G,
} from 'react-native-svg';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Activity,
  Layers,
  Filter,
  Check,
  Flame,
  ChartBar,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { spacing, isCompactScreen } from '../../theme/responsive';

/**
 * SpcControlChart: Statistical Process Control (p-Chart)
 * Displays fraction defective (p_i), Center Line (CL), Upper Control Limit (UCL),
 * and Lower Control Limit (LCL) with 3-Sigma ISO statistical limits.
 * Clean, uncluttered layout with Top 10 Defect Stratified filter and analytical line chart.
 */
/**
 * Format string rentang waktu agar ringkas dan ramah dibaca (e.g. 1 Apr – 6 Nov 2026)
 */
const formatFriendlyPeriod = (rawLabel) => {
  if (!rawLabel) return 'Hari Ini';
  if (rawLabel === 'today' || rawLabel === 'Hari Ini') return 'Hari Ini';
  if (rawLabel === 'yesterday' || rawLabel === 'Kemarin') return 'Kemarin';
  if (rawLabel === 'weekly' || rawLabel === '7 Hari Terakhir') return '7 Hari Terakhir';
  if (rawLabel === 'monthly' || rawLabel === 'Bulan Ini') return 'Bulan Ini';

  if (typeof rawLabel === 'string' && rawLabel.includes('s/d')) {
    const parts = rawLabel.split('s/d').map((s) => s.trim());
    if (parts.length === 2) {
      const [startStr, endStr] = parts;
      const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      try {
        const [y1, m1, d1] = startStr.split('-').map(Number);
        const [y2, m2, d2] = endStr.split('-').map(Number);
        if (y1 && m1 && d1 && y2 && m2 && d2) {
          const sFmt = y1 === y2 ? `${d1} ${shortMonths[m1 - 1]}` : `${d1} ${shortMonths[m1 - 1]} ${y1}`;
          const eFmt = `${d2} ${shortMonths[m2 - 1]} ${y2}`;
          return `${sFmt} – ${eFmt}`;
        }
      } catch (e) {}
    }
  }

  if (typeof rawLabel === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawLabel.trim())) {
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    try {
      const [y, m, d] = rawLabel.trim().split('-').map(Number);
      return `${d} ${shortMonths[m - 1]} ${y}`;
    } catch (e) {}
  }

  return rawLabel;
};

export const SpcControlChart = ({
  spcData = {},
  loading = false,
  period = 'daily',
  selectedDefect = 'ALL',
  onSelectDefect,
  onMitigateAi,
  selectedPointIndex: controlledPointIndex,
  onSelectPoint,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const { colors, isDark } = useTheme();
  const [internalPointIndex, setInternalPointIndex] = useState(null);

  const selectedPointIndex =
    controlledPointIndex !== undefined ? controlledPointIndex : internalPointIndex;

  const handlePointPress = (idx, pt) => {
    if (controlledPointIndex === undefined) {
      setInternalPointIndex(idx);
    }
    if (onSelectPoint) {
      onSelectPoint(idx, pt);
    }
  };

  const handleChartLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  const activeDefect = selectedDefect || spcData?.selectedDefect || 'ALL';
  const topDefects = Array.isArray(spcData?.topDefects) ? spcData.topDefects : [];

  const activePeriod = spcData?.period || period || 'today';
  const periodLabel =
    spcData?.periodLabel ||
    (activePeriod === 'today' || activePeriod === 'daily'
      ? 'Hari Ini'
      : activePeriod === 'yesterday'
      ? 'Kemarin'
      : activePeriod === 'weekly'
      ? '7 Hari Terakhir'
      : activePeriod === 'monthly'
      ? 'Bulan Ini'
      : activePeriod === 'custom'
      ? 'Date to Date'
      : 'Hari Ini');
  const friendlyPeriod = formatFriendlyPeriod(periodLabel);

  const points = spcData?.points || [];
  const uclVal = spcData?.ucl != null ? spcData.ucl : 0;
  const clVal = spcData?.centerLine != null ? spcData.centerLine : 0;
  const lclVal = spcData?.lcl != null ? spcData.lcl : 0;
  const isOutOfControl = spcData?.status === 'OUT-OF-CONTROL';
  const outOfControlCount = spcData?.outOfControlCount || 0;

  // Validasi keberadaan data inspeksi riil dalam rentang (wajib ada produksi > 0)
  const hasData = points.length > 0 && Number(spcData?.totalProduced || 0) > 0;

  // Selected or highest anomaly point for inspection detail
  const activePoint = hasData
    ? selectedPointIndex != null && points[selectedPointIndex]
      ? points[selectedPointIndex]
      : spcData?.topAnomaly || (points.length > 0 ? points[points.length - 1] : null)
    : null;

  // Akumulasi total kuantitas cacat dan objek cacat aktif untuk tampilan dinamis
  const totalAllDefect =
    spcData?.totalNg != null
      ? Number(spcData.totalNg)
      : topDefects.reduce((acc, d) => acc + Number(d.count || 0), 0);

  const activeDefectObj = topDefects.find(
    (d) => (d.name || '').toLowerCase() === activeDefect.toLowerCase()
  );

  // Helper metadata rank & pewarnaan tingkat urgensi cacat
  const getRankMeta = (index) => {
    if (index === 0) {
      return {
        rankLabel: '#1 UTAMA',
        accentColor: colors.critical,
        badgeBg: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEE2E2',
        badgeText: isDark ? '#FCA5A5' : '#DC2626',
        borderColor: colors.border,
      };
    }
    return {
      rankLabel: `#${index + 1}`,
      accentColor: colors.primary,
      badgeBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      badgeText: colors.textSecondary,
      borderColor: colors.border,
    };
  };

  // SVG Chart Geometry
  const cardPadding = spacing(14);
  const availableWidth = containerWidth > 0
    ? containerWidth
    : Math.max(280, windowWidth - spacing(12) * 2 - cardPadding * 2);
  const padLeft = 46;
  const padRight = 36;
  const padTop = 18;
  const padBottom = 48;
  const chartHeight = 175;
  const minPointSpacing = 76; // Ruang horizontal minimal per mesin agar titik dan teks tidak bertumpuk
  const isScrollable = points.length >= 5;
  const chartWidth = isScrollable
    ? Math.max(availableWidth, padLeft + padRight + points.length * minPointSpacing)
    : availableWidth;
  const plotW = Math.max(10, chartWidth - padLeft - padRight);
  const plotH = chartHeight - padTop - padBottom;

  // Compute maximum Y bound for scaling (auto-adapts for stratified small percentages)
  const maxP = points.length > 0 ? Math.max(...points.map((p) => p.pPercent || 0)) : 0;
  const rawMax = Math.max(uclVal * 1.3, maxP * 1.25);
  const maxY = rawMax > 0 ? Math.max(rawMax, 0.5) : 1.0;

  // Coordinate mapping functions
  const getY = (valPercent) => {
    const clamped = Math.max(0, Math.min(valPercent, maxY));
    return padTop + plotH - (clamped / maxY) * plotH;
  };

  const getX = (idx, total) => {
    if (total <= 1) return padLeft + plotW / 2;
    // Berikan ruang nafas jika titik hanya 2-3 mesin agar titik & teks tidak menempel ke batas sumbu Y
    const innerMargin = total <= 3 ? Math.min(32, plotW * 0.12) : 0;
    const effectivePlotW = plotW - innerMargin * 2;
    return padLeft + innerMargin + (idx / (total - 1)) * effectivePlotW;
  };

  // Build SVG path string connecting all data points
  let linePathD = '';
  points.forEach((pt, idx) => {
    const x = getX(idx, points.length);
    const y = getY(pt.pPercent);
    if (idx === 0) {
      linePathD += `M ${x} ${y}`;
    } else {
      linePathD += ` L ${x} ${y}`;
    }
  });

  const renderSvgChart = () => (
    <Svg width={chartWidth} height={chartHeight} style={{ overflow: 'hidden' }}>
      {/* Background Chart Area */}
      <Rect
        x={padLeft}
        y={padTop}
        width={plotW}
        height={plotH}
        fill={isDark ? '#0F172A40' : '#F8FAFC80'}
        rx={6}
      />

      {/* In-Control Shaded Safe Zone (between CL and UCL) */}
      {getY(uclVal) < getY(lclVal) && (
        <Rect
          x={padLeft}
          y={getY(uclVal)}
          width={plotW}
          height={Math.max(2, getY(lclVal) - getY(uclVal))}
          fill={isDark ? '#10B98108' : '#10B98110'}
        />
      )}

      {/* Y-Axis Gridlines & Reference Labels */}
      {/* 1. UCL Line (Red Dashed) */}
      <Line
        x1={padLeft}
        y1={getY(uclVal)}
        x2={padLeft + plotW}
        y2={getY(uclVal)}
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeDasharray="4, 3"
      />
      <SvgText
        x={padLeft - 6}
        y={getY(uclVal) + 4}
        fontSize="9"
        fontWeight="bold"
        fill="#EF4444"
        textAnchor="end"
      >
        UCL
      </SvgText>

      {/* 2. Center Line (Blue Solid) */}
      <Line
        x1={padLeft}
        y1={getY(clVal)}
        x2={padLeft + plotW}
        y2={getY(clVal)}
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      <SvgText
        x={padLeft - 6}
        y={getY(clVal) + 4}
        fontSize="9"
        fontWeight="bold"
        fill="#3B82F6"
        textAnchor="end"
      >
        CL
      </SvgText>

      {/* 3. LCL Line (Green Dashed) */}
      <Line
        x1={padLeft}
        y1={getY(lclVal)}
        x2={padLeft + plotW}
        y2={getY(lclVal)}
        stroke="#10B981"
        strokeWidth="1.5"
        strokeDasharray="4, 3"
      />
      <SvgText
        x={padLeft - 6}
        y={getY(lclVal) + 4}
        fontSize="9"
        fontWeight="bold"
        fill="#10B981"
        textAnchor="end"
      >
        LCL
      </SvgText>

      {/* Trend Polyline */}
      {linePathD ? (
        <Path
          d={linePathD}
          fill="none"
          stroke={isDark ? '#94A3B8' : '#64748B'}
          strokeWidth="2"
        />
      ) : null}

      {/* Subgroup Points & Machine Labels */}
      {points.map((pt, idx) => {
        const cx = getX(idx, points.length);
        const cy = getY(pt.pPercent);
        const isSelected = activePoint?.id === pt.id;

        return (
          <G
            key={pt.id || idx}
            onPress={() => handlePointPress(idx, pt)}
          >
            {/* Touch hit area for fingers / gloves */}
            <Circle
              cx={cx}
              cy={cy}
              r="22"
              fill="transparent"
            />

            {/* Out of Control Glowing Halo */}
            {pt.isOutOfControl && (
              <Circle
                cx={cx}
                cy={cy}
                r="9"
                fill="#EF4444"
                opacity="0.3"
              />
            )}

            {/* Selected Point Ring */}
            {isSelected && (
              <Circle
                cx={cx}
                cy={cy}
                r="8"
                fill="none"
                stroke={colors.primary}
                strokeWidth="2"
              />
            )}

            {/* Core Data Point */}
            <Circle
              cx={cx}
              cy={cy}
              r={isSelected ? '5' : '3.5'}
              fill={pt.isOutOfControl ? '#EF4444' : isSelected ? colors.primary : '#3B82F6'}
              stroke="#FFFFFF"
              strokeWidth={isSelected ? '1.5' : '0.8'}
            />

            {/* Active Capsule Highlight for Selected Machine */}
            {isSelected && (
              <Rect
                x={cx - 30}
                y={padTop + plotH + 5}
                width={60}
                height={33}
                rx={6}
                fill={isDark ? 'rgba(59, 130, 246, 0.22)' : '#DBEAFE'}
                stroke={colors.primary}
                strokeWidth="1.2"
              />
            )}

            {/* Subtle vertical tick mark from plot line to label */}
            <Line
              x1={cx}
              y1={padTop + plotH}
              x2={cx}
              y2={padTop + plotH + 4}
              stroke={isSelected ? colors.primary : (isDark ? '#334155' : '#CBD5E1')}
              strokeWidth="1"
            />

            {/* Clean Horizontal Machine Name (Never rotated, Never clipped) */}
            <SvgText
              x={cx}
              y={padTop + plotH + 18}
              fontSize="10.5"
              fontWeight={isSelected ? '800' : '600'}
              fill={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : colors.textPrimary}
              textAnchor="middle"
            >
              {pt.label}
            </SvgText>

            {/* Subgroup Index (#1, #2, ...) */}
            <SvgText
              x={cx}
              y={padTop + plotH + 31}
              fontSize="8.5"
              fontWeight="600"
              fill={isSelected ? colors.primary : colors.textSecondary}
              textAnchor="middle"
            >
              #{idx + 1}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top Header: Title + Real-time Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Activity
              size={16}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              SPC CONTROL CHART
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {activeDefect && activeDefect !== 'ALL'
              ? `p-Chart • Cacat: ${activeDefect}`
              : `p-Chart • ${friendlyPeriod}`}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: !hasData
                ? (isDark ? '#334155' : '#F1F5F9')
                : isOutOfControl
                ? colors.critical + '18'
                : colors.success + '18',
              borderColor: !hasData
                ? colors.border
                : isOutOfControl
                ? colors.critical + '60'
                : colors.success + '60',
            },
          ]}
        >
          {!hasData ? (
            <>
              <Info size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
              <Text style={[styles.statusBadgeText, { color: colors.textSecondary }]}>
                BELUM ADA DATA
              </Text>
            </>
          ) : isOutOfControl ? (
            <>
              <AlertTriangle size={11} color={colors.critical} style={{ marginRight: 3 }} />
              <Text style={[styles.statusBadgeText, { color: colors.critical }]}>
                OUT-OF-CONTROL
              </Text>
            </>
          ) : (
            <>
              <CheckCircle2 size={11} color={colors.success} style={{ marginRight: 3 }} />
              <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                IN-CONTROL
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Dynamic Stratifikasi Top 5 Defect Section */}
      {topDefects.length > 0 ? (
        <View style={styles.defectFilterWrapper}>
          {/* Section Header Strip */}
          <View style={styles.defectFilterHeader}>
            <View style={styles.defectHeaderLeft}>
              <ChartBar size={14} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.defectHeaderTitle, { color: colors.textPrimary }]}>
                STRATIFIKASI CACAT
              </Text>
              <View
                style={[
                  styles.defectTotalBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.defectTotalText, { color: colors.textSecondary }]}>
                  {totalAllDefect} pcs
                </Text>
              </View>
            </View>
            <View style={styles.defectHeaderRight}>
              <Text style={[styles.defectScrollHint, { color: colors.textMuted }]}>
                Geser →
              </Text>
            </View>
          </View>

          {/* Horizontal Scrollable Defect Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.defectFilterScrollContent}
          >
            {/* Master Option: Semua Cacat (Overall) */}
            <Pressable
              onPress={() => onSelectDefect && onSelectDefect('ALL')}
              style={({ pressed }) => [
                styles.defectCardChip,
                activeDefect === 'ALL'
                  ? [
                      styles.defectCardChipActive,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        shadowColor: colors.primary,
                      },
                    ]
                  : [
                      styles.defectCardChipInactive,
                      {
                        backgroundColor: colors.cardSubtle,
                        borderColor: colors.border,
                      },
                    ],
                pressed && styles.defectChipPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Filter semua jenis cacat akumulasi"
            >
              <View style={styles.defectCardHeaderRow}>
                <View
                  style={[
                    styles.defectRankBadge,
                    {
                      backgroundColor: activeDefect === 'ALL'
                        ? 'rgba(255, 255, 255, 0.22)'
                        : isDark
                        ? 'rgba(59, 130, 246, 0.2)'
                        : '#EFF6FF',
                      borderColor: activeDefect === 'ALL'
                        ? 'rgba(255, 255, 255, 0.4)'
                        : isDark
                        ? 'rgba(59, 130, 246, 0.4)'
                        : '#BFDBFE',
                    },
                  ]}
                >
                  <Filter
                    size={10}
                    color={activeDefect === 'ALL' ? '#FFFFFF' : colors.primary}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.defectRankText,
                      { color: activeDefect === 'ALL' ? '#FFFFFF' : colors.primary },
                    ]}
                  >
                    OVERALL
                  </Text>
                </View>

                {activeDefect === 'ALL' && (
                  <View style={styles.defectActiveCheck}>
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.defectCardName,
                  { color: activeDefect === 'ALL' ? '#FFFFFF' : colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                Semua Cacat
              </Text>

              <View style={styles.defectMetricsRow}>
                <Text
                  style={[
                    styles.defectCountBold,
                    { color: activeDefect === 'ALL' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {totalAllDefect} <Text style={styles.defectUnitText}>pcs</Text>
                </Text>
                <View
                  style={[
                    styles.defectDotSep,
                    {
                      backgroundColor: activeDefect === 'ALL'
                        ? 'rgba(255, 255, 255, 0.5)'
                        : colors.textMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.defectPercentageText,
                    { color: activeDefect === 'ALL' ? '#E0E7FF' : colors.primary },
                  ]}
                >
                  100%
                </Text>
              </View>

              <View
                style={[
                  styles.microTrack,
                  {
                    backgroundColor: activeDefect === 'ALL'
                      ? 'rgba(255, 255, 255, 0.25)'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.microFill,
                    {
                      width: '100%',
                      backgroundColor: activeDefect === 'ALL' ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                />
              </View>
            </Pressable>

            {/* Top 5 Defect Individual Cards */}
            {topDefects.map((defect, idx) => {
              const isSelected = activeDefect.toLowerCase() === (defect.name || '').toLowerCase();
              const meta = getRankMeta(idx);
              const pVal = Math.min(100, Math.max(0, defect.percentage || 0));

              return (
                <Pressable
                  key={defect.id || defect.name || idx}
                  onPress={() => onSelectDefect && onSelectDefect(defect.name)}
                  style={({ pressed }) => [
                    styles.defectCardChip,
                    isSelected
                      ? [
                          styles.defectCardChipActive,
                          {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                            shadowColor: colors.primary,
                          },
                        ]
                      : [
                          styles.defectCardChipInactive,
                          {
                            backgroundColor: colors.cardSubtle,
                            borderColor: meta.borderColor,
                          },
                        ],
                    pressed && styles.defectChipPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter cacat ${defect.name}, ${defect.count} pcs, ${pVal} persen`}
                >
                  <View style={styles.defectCardHeaderRow}>
                    <View
                      style={[
                        styles.defectRankBadge,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255, 255, 255, 0.22)'
                            : meta.badgeBg,
                          borderColor: isSelected
                            ? 'rgba(255, 255, 255, 0.4)'
                            : meta.borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.defectRankText,
                          { color: isSelected ? '#FFFFFF' : meta.badgeText },
                        ]}
                      >
                        {meta.rankLabel}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={styles.defectActiveCheck}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.defectCardName,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {defect.name}
                  </Text>

                  <View style={styles.defectMetricsRow}>
                    <Text
                      style={[
                        styles.defectCountBold,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {defect.count} <Text style={styles.defectUnitText}>pcs</Text>
                    </Text>
                    <View
                      style={[
                        styles.defectDotSep,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255, 255, 255, 0.5)'
                            : colors.textMuted,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.defectPercentageText,
                        { color: isSelected ? '#E0E7FF' : colors.textSecondary },
                      ]}
                    >
                      {pVal}%
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.microTrack,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.microFill,
                        {
                          width: `${Math.max(10, pVal)}%`,
                          backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Dynamic Active Context & Filter Feedback Banner */}
          <View
            style={[
              styles.activeContextBanner,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : '#F1F5F9',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.activeContextLeft}>
              {activeDefect === 'ALL' ? (
                <Layers size={14} color={colors.primary} style={{ marginRight: 6 }} />
              ) : (
                <Flame size={14} color="#EF4444" style={{ marginRight: 6 }} />
              )}
              <Text
                style={[
                  styles.activeContextText,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {activeDefect === 'ALL' ? (
                  <>
                    <Text style={{ fontWeight: '800', color: colors.primary }}>
                      Semua Cacat
                    </Text>{' '}
                    ({totalAllDefect} pcs)
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        fontWeight: '800',
                        color: colors.primary,
                      }}
                    >
                      {activeDefect}
                    </Text>
                    {activeDefectObj
                      ? ` (${activeDefectObj.count} pcs • ${activeDefectObj.percentage}%)`
                      : ''}
                  </>
                )}
              </Text>
            </View>

            <View style={styles.activeContextRight}>
              <View
                style={[
                  styles.activeMachinePill,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activeMachineText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {points.length} Mesin
                </Text>
              </View>

              {activeDefect !== 'ALL' && (
                <Pressable
                  onPress={() => onSelectDefect && onSelectDefect('ALL')}
                  style={styles.resetFilterBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Reset filter ke semua cacat"
                >
                  <RotateCcw size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
                  <Text style={[styles.resetFilterText, { color: colors.textSecondary }]}>
                    Reset
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      ) : hasData ? (
        <View
          style={[
            styles.zeroDefectCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
            },
          ]}
        >
          <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 8 }} />
          <Text style={[styles.zeroDefectText, { color: colors.textPrimary }]}>
            🛡️ Zero Defect: Belum ada temuan cacat pada periode ini. Kualitas proses 100% prima!
          </Text>
        </View>
      ) : null}

      {/* Control Limits Bento Metrics Bar (UCL, CL, LCL) */}
      <View style={styles.limitsBar}>
        {/* UCL Pill */}
        <View
          style={[
            styles.limitChip,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.limitDot, { backgroundColor: colors.critical }]} />
          <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>UCL:</Text>
          <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
            {hasData ? `${uclVal.toFixed(2)}%` : '-'}
          </Text>
        </View>

        {/* Center Line Pill */}
        <View
          style={[
            styles.limitChip,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.limitDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>CL (p̄):</Text>
          <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
            {hasData ? `${clVal.toFixed(2)}%` : '-'}
          </Text>
        </View>

        {/* LCL Pill */}
        <View
          style={[
            styles.limitChip,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.limitDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>LCL:</Text>
          <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
            {hasData ? `${lclVal.toFixed(2)}%` : '-'}
          </Text>
        </View>
      </View>

      {/* Chart Canvas Area */}
      {loading ? (
        <View style={[styles.loadingBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Menghitung batas kendali SPC ({periodLabel})...
          </Text>
        </View>
      ) : !hasData ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <Layers size={28} color={colors.textSecondary} style={{ marginBottom: 6 }} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {activeDefect && activeDefect !== 'ALL'
              ? `Tidak Ada Mesin Terkena Cacat "${activeDefect}"`
              : 'Belum Ada Data Inspeksi pada Periode Ini'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {activeDefect && activeDefect !== 'ALL'
              ? `Seluruh lini mesin beroperasi bersih dari temuan cacat ${activeDefect} pada periode ${periodLabel.toLowerCase()} (Zero Defect).`
              : `Silakan lakukan pencatatan produksi dan inspeksi mutu untuk periode ${periodLabel.toLowerCase()} terlebih dahulu.`}
          </Text>
        </View>
      ) : (
        <View style={styles.chartWrapper} onLayout={handleChartLayout}>
          {isScrollable ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollChartContainer}
              style={styles.scrollChartWrapper}
            >
              {renderSvgChart()}
            </ScrollView>
          ) : (
            renderSvgChart()
          )}
        </View>
      )}

      {/* Point Detail Inspector & Out-of-Control Callout */}
      {hasData && activePoint && (
        <View
          style={[
            styles.inspectorBox,
            {
              backgroundColor: colors.cardSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.inspectorTop}>
            <View style={{ flex: 1 }}>
              <View style={styles.inspectorTitleRow}>
                <Text style={[styles.inspectorLabel, { color: colors.textPrimary }]}>
                  Sampel #{activePoint.index || 1}: {activePoint.machineName || activePoint.label}
                </Text>
                {activePoint.isOutOfControl && (
                  <View style={[styles.oocPill, { backgroundColor: colors.critical }]}>
                    <Text style={styles.oocPillText}>SPK Out-of-Control</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.inspectorProcess, { color: colors.textSecondary }]}>
                Proses: {activePoint.process} • {activeDefect !== 'ALL' ? `Cacat: ${activeDefect}` : `Cacat Dominan: ${activePoint.topDefect}`}
              </Text>
            </View>

            <View style={styles.rateBox}>
              <Text
                style={[
                  styles.rateVal,
                  { color: activePoint.isOutOfControl ? colors.critical : colors.primary },
                ]}
              >
                {activePoint.pPercent}%
              </Text>
              <Text style={[styles.rateCaption, { color: colors.textMuted }]}>
                Defect Rate
              </Text>
            </View>
          </View>

          {/* Subgroup Volume Stats */}
          <View style={styles.inspectorStatsRow}>
            <Text style={[styles.inspectorStatItem, { color: colors.textSecondary }]}>
              Produksi: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{activePoint.produced.toLocaleString('id-ID')} pcs</Text>
            </Text>
            <Text style={[styles.inspectorStatItem, { color: colors.textSecondary }]}>
              {activeDefect !== 'ALL' ? `Cacat ${activeDefect}` : 'Total NG'}: <Text style={{ color: colors.critical, fontWeight: '700' }}>{activePoint.ng.toLocaleString('id-ID')} pcs</Text>
            </Text>
            <Text style={[styles.inspectorStatItem, { color: colors.textSecondary }]}>
              UCL: <Text style={{ color: colors.critical, fontWeight: '700' }}>{activePoint.ucl}%</Text>
            </Text>
          </View>

          {/* Out-of-control Explanation */}
          {activePoint.isOutOfControl && (
            <View style={styles.alertDetailRow}>
              <AlertTriangle size={14} color={colors.critical} style={{ marginRight: 6 }} />
              <Text style={[styles.alertDetailText, { color: colors.critical }]}>
                {activePoint.outOfControlReason ||
                  'Proporsi cacat melampaui batas kendali 3-Sigma. Diperlukan tindakan korektif segera!'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing(14),
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  title: {
    fontSize: isCompactScreen ? 12.5 : 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 22,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  defectFilterWrapper: {
    marginBottom: 14,
  },
  defectFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  defectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defectHeaderTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  defectTotalBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  defectTotalText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  defectHeaderRight: {},
  defectScrollHint: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  defectFilterScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 10,
  },
  defectCardChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    minWidth: 165,
    minHeight: 82,
    justifyContent: 'space-between',
  },
  defectCardChipActive: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  defectCardChipInactive: {},
  defectChipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  defectCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  defectRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  defectRankText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  defectCardName: {
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  defectActiveCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defectMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  defectCountBold: {
    fontSize: typography.sizes.caption,
    fontWeight: '900',
  },
  defectUnitText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  defectDotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  defectPercentageText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  microTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  microFill: {
    height: '100%',
    borderRadius: 2,
  },
  activeContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  activeContextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  activeContextRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeContextText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
    flex: 1,
  },
  activeMachinePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeMachineText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  resetFilterText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  zeroDefectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  zeroDefectText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    flex: 1,
  },
  limitsBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  limitChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1.2,
    minHeight: 32,
  },
  limitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  limitLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginRight: 3,
  },
  limitValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },
  scrollChartWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollChartContainer: {
    paddingRight: 20,
    paddingTop: 4,
  },
  scrollHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 6,
  },
  scrollHintText: {
    fontSize: typography.sizes.micro ? typography.sizes.micro - 1 : 11,
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 8,
  },
  loadingText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  inspectorBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 16,
  },
  inspectorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  inspectorLabel: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
  oocPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  oocPillText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  inspectorProcess: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  rateBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  rateVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  rateCaption: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  inspectorStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  inspectorStatItem: {
    fontSize: typography.sizes.caption,
  },
  alertDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  alertDetailText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});

export default SpcControlChart;
