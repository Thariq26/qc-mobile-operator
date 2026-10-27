import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  Layers,
  AlertOctagon,
  Percent,
  MessageSquareWarning,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  CalendarDays,
  SlidersHorizontal,
  Factory,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { SpcControlChart } from '../../components/dashboard/SpcControlChart';
import { RfModal } from '../../components/dashboard/RfModal';
import { CalendarRangeModal } from '../../components/common/CalendarRangeModal';
import { SpringButton } from '../../components/common/SpringButton';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { dashboardService } from '../../api/services/dashboardService';
import { defectService } from '../../api/services/defectService';
import { productionService } from '../../api/services/productionService';
import { aiService } from '../../api/services/aiService';
import { getLocalDateString } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';
import { useFocusEffect } from '@react-navigation/native';

const TIME_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'custom', label: 'Date to Date' },
];

/**
 * Format string rentang tanggal untuk preview dinamis yang informatif
 */
const formatPrettyRange = (startStr, endStr) => {
  if (!startStr || !endStr) return 'Pilih Rentang Tanggal';
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  try {
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffDays = Math.max(1, Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const sFormatted = `${d1} ${shortMonths[m1 - 1]} ${y1}`;
    const eFormatted = `${d2} ${shortMonths[m2 - 1]} ${y2}`;
    return `${sFormatted} — ${eFormatted} (${diffDays} Hari)`;
  } catch (e) {
    return `${startStr} s/d ${endStr}`;
  }
};

export const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, isOperatorProduksi, isStaffQc, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // 'today' | 'yesterday' | 'custom'
  const [filterLoading, setFilterLoading] = useState(false);

  // Date to Date Custom State & Interactive Calendar Modal
  const [customStartDate, setCustomStartDate] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return getLocalDateString(start);
  });
  const [customEndDate, setCustomEndDate] = useState(getLocalDateString());
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const [kpiData, setKpiData] = useState({
    totalProduction: 0,
    totalNg: 0,
    defectRate: 0,
    totalComplaints: 0,
  });

  const [spcData, setSpcData] = useState({
    status: 'IN-CONTROL',
    points: [],
    ucl: 0,
    centerLine: 0,
    lcl: 0,
    topAnomaly: null,
  });
  const [dailyProdData, setDailyProdData] = useState([]);

  // State Filter Jenis Defect untuk Stratified p-Chart (Drilldown Top 10)
  const [selectedDefect, setSelectedDefect] = useState('ALL');

  // Random Forest Modal State
  const [rfModalVisible, setRfModalVisible] = useState(false);
  const [rfLoading, setRfLoading] = useState(false);
  const [rfPrediction, setRfPrediction] = useState(null);

  const fetchDashboardData = useCallback(async (
    periodToFetch = selectedPeriod,
    isManualRefresh = false,
    customStart = customStartDate,
    customEnd = customEndDate,
    defectToFetch = selectedDefect
  ) => {
    if (!isManualRefresh) setFilterLoading(true);
    try {
      const username = user?.username;
      const role = user?.role;

      // Silently sync any offline records in background if network is active
      try {
        await Promise.allSettled([
          defectService.syncOfflineDefects(),
          productionService.syncOfflineProduction(),
        ]);
      } catch (e) {
        // network inactive, ignore
      }

      const [summary, spc, dailyProd] = await Promise.all([
        dashboardService.getSummary(null, null, username, role, periodToFetch, customStart, customEnd),
        dashboardService.getSpcData(periodToFetch, username, role, customStart, customEnd, defectToFetch),
        dashboardService.getDailyProduction(username, role, periodToFetch, customStart, customEnd, defectToFetch),
      ]);

      setKpiData(summary);
      setSpcData(spc);
      setDailyProdData(dailyProd);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setFilterLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate, selectedDefect, user?.username, user?.role]);

  // Handler pergantian jenis cacat pada Stratified p-Chart & Status Mesin Terdampak
  const handleSelectDefect = async (defectName) => {
    setSelectedDefect(defectName);
    setFilterLoading(true);
    try {
      const [spc, dailyProd] = await Promise.all([
        dashboardService.getSpcData(
          selectedPeriod,
          user?.username,
          user?.role,
          customStartDate,
          customEndDate,
          defectName
        ),
        dashboardService.getDailyProduction(
          user?.username,
          user?.role,
          selectedPeriod,
          customStartDate,
          customEndDate,
          defectName
        ),
      ]);
      setSpcData(spc);
      setDailyProdData(dailyProd);
    } catch (err) {
      console.warn('Gagal memuat data defect terpilih:', err);
    } finally {
      setFilterLoading(false);
    }
  };

  // Handler pergantian filter tab waktu terpadu (Daily, Monthly, Date to Date)
  const handlePeriodChange = (newPeriod) => {
    if (filterLoading) return;
    if (newPeriod === 'custom') {
      setSelectedPeriod('custom');
      setCalendarModalVisible(true);
    } else {
      setSelectedPeriod(newPeriod);
      fetchDashboardData(newPeriod, false, customStartDate, customEndDate, selectedDefect);
    }
  };

  // Handler saat rentang tanggal kustom diterapkan via Pop-up Kalender
  const handleApplyCalendarRange = (newStart, newEnd) => {
    setCustomStartDate(newStart);
    setCustomEndDate(newEnd);
    setSelectedPeriod('custom');
    fetchDashboardData('custom', false, newStart, newEnd, selectedDefect);
  };

  // Auto re-fetch dashboard metrics whenever user focuses/returns to this tab
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(selectedPeriod, true, customStartDate, customEndDate, selectedDefect);
    }, [fetchDashboardData, selectedPeriod, customStartDate, customEndDate, selectedDefect])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(selectedPeriod, true, customStartDate, customEndDate, selectedDefect);
  };

  // Judul dinamis untuk Section Status Mesin
  const getMachineSectionTitle = () => {
    if (selectedDefect && selectedDefect !== 'ALL') {
      return isStaffQc
        ? `STATUS MESIN TERDAMPAK CACAT: ${selectedDefect.toUpperCase()}`
        : `MESIN TERDAMPAK CACAT: ${selectedDefect.toUpperCase()}`;
    }
    if (selectedPeriod === 'weekly') {
      return isStaffQc
        ? 'STATUS KUALITAS MESIN MINGGU INI (7 HARI TERAKHIR)'
        : 'STATUS PRODUKSI MESIN MINGGU INI (7 HARI TERAKHIR)';
    }
    if (selectedPeriod === 'monthly') {
      return isStaffQc
        ? 'STATUS KUALITAS MESIN BULAN INI (30 HARI TERAKHIR)'
        : 'STATUS PRODUKSI MESIN BULAN INI (30 HARI TERAKHIR)';
    }
    if (selectedPeriod === 'custom') {
      return isStaffQc
        ? `STATUS KUALITAS MESIN (${customStartDate} s/d ${customEndDate})`
        : `STATUS PRODUKSI MESIN (${customStartDate} s/d ${customEndDate})`;
    }
    return isStaffQc ? 'STATUS KUALITAS MESIN HARI INI' : 'STATUS PRODUKSI MESIN HARI INI';
  };

  // Sub-judul dinamis untuk Section Status Mesin
  const getMachineSectionSubtitle = () => {
    if (selectedDefect && selectedDefect !== 'ALL') {
      return `Hanya menampilkan mesin yang mengalami cacat "${selectedDefect}" (${dailyProdData.length} mesin terdampak)`;
    }
    if (selectedPeriod === 'weekly') {
      return isStaffQc
        ? 'Agregasi Mutu & Performa Cacat Mesin 7 Hari Terakhir'
        : 'Pencapaian Akumulasi Kuota Mesin 7 Hari Terakhir';
    }
    if (selectedPeriod === 'monthly') {
      return isStaffQc
        ? 'Agregasi Mutu & Performa Cacat Mesin 30 Hari Terakhir'
        : 'Pencapaian Akumulasi Kuota Mesin 30 Hari Terakhir';
    }
    return isStaffQc
      ? 'Monitoring Tingkat Cacat & Performa Kualitas Tiap Mesin'
      : isAdmin
      ? 'Seluruh Mesin Pabrik • Aktual vs Target'
      : 'Pencapaian Target vs Aktual Kuota Operator';
  };

  const handleOpenRfPrediction = async (customDefect, customProcess) => {
    const topDefect = customDefect || spcData?.topAnomaly?.topDefect;
    const process = customProcess || spcData?.topAnomaly?.process || 'Stamping';

    if (!topDefect) {
      Alert.alert(
        'Belum Ada Data Cacat',
        'Belum ada temuan cacat yang tercatat pada periode ini untuk dianalisis oleh AI.'
      );
      return;
    }

    setRfLoading(true);
    try {
      const prediction = await aiService.predictRfAction(process, topDefect);
      setRfPrediction(prediction);
      setRfModalVisible(true);
    } catch (err) {
      console.warn('RF prediction error:', err);
    } finally {
      setRfLoading(false);
    }
  };

  const topAnomaly = spcData?.topAnomaly || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Section 1: 4 Bento Grid KPI Cards (2x2) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {isOperatorProduksi ? 'RINGKASAN METRIK PRODUKSI & PROSES' : 'RINGKASAN METRIK KUALITAS'}
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
            {isAdmin
              ? 'Pabrik Global • Live Synchronized'
              : isOperatorProduksi
              ? 'Operator Produksi • Shop Floor Scoped'
              : 'Staff QC Inspector • Plant Quality Scoped'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.kpiGrid}>
            <SkeletonLoader width="48.5%" height={110} borderRadius={16} />
            <SkeletonLoader width="48.5%" height={110} borderRadius={16} />
            <SkeletonLoader width="48.5%" height={110} borderRadius={16} />
            <SkeletonLoader width="48.5%" height={110} borderRadius={16} />
          </View>
        ) : (
          <View style={styles.kpiGrid}>
            {/* KPI 1: Total Produksi / Total Part Diinspeksi */}
            <KpiCard
              title={isStaffQc ? "Total Part Diinspeksi" : "Total Produksi"}
              value={kpiData.totalProduction != null ? kpiData.totalProduction.toLocaleString('id-ID') : '0'}
              unit="pcs"
              badgeText={
                isStaffQc
                  ? "Populasi Lot Produksi"
                  : isAdmin
                  ? "Seluruh Lini Pabrik"
                  : kpiData.totalProduction > 0
                  ? "Tercatat di sistem"
                  : "Belum ada produksi"
              }
              badgeVariant={kpiData.totalProduction > 0 ? "success" : "primary"}
              icon={<Layers size={16} color={colors.success} />}
            />

            {/* KPI 2: Total NG Defect */}
            <KpiCard
              title="Total NG / Defect"
              value={kpiData.totalNg != null ? kpiData.totalNg.toLocaleString('id-ID') : '0'}
              unit="pcs"
              badgeText={isAdmin ? (kpiData.totalNg > 0 ? `${kpiData.totalNg} pcs pabrik` : "Zero NG Pabrik") : (kpiData.totalNg > 0 ? `${kpiData.totalNg} pcs tercatat` : "Nol Cacat (Zero NG)")}
              badgeVariant={kpiData.totalNg > 0 ? "critical" : "success"}
              icon={<AlertOctagon size={16} color={colors.critical} />}
            />

            {/* KPI 3: Defect Rate */}
            <KpiCard
              title="Defect Rate"
              value={kpiData.totalProduction === 0 && kpiData.totalNg > 0 ? "N/A" : `${kpiData.defectRate != null ? kpiData.defectRate : 0}%`}
              badgeText={
                kpiData.totalProduction === 0 && kpiData.totalNg > 0
                  ? "Menunggu Input Prod"
                  : kpiData.defectRate > 2.0
                  ? "Di atas batas 2%"
                  : (isAdmin ? "Target Pabrik Tercapai" : "Kualitas Baik (< 2%)")
              }
              badgeVariant={
                kpiData.totalProduction === 0 && kpiData.totalNg > 0
                  ? "primary"
                  : kpiData.defectRate > 2.0
                  ? "warning"
                  : "success"
              }
              icon={<Percent size={16} color={colors.warning} />}
            />

            {/* KPI 4: Kasus Komplain Customer */}
            <KpiCard
              title="Kasus Komplain"
              value={`${kpiData.totalComplaints != null ? kpiData.totalComplaints : 0}`}
              unit="kasus"
              badgeText={kpiData.totalComplaints > 0 ? `${kpiData.totalComplaints} kasus aktif` : "Nol Komplain"}
              badgeVariant={kpiData.totalComplaints > 0 ? "purple" : "primary"}
              icon={<MessageSquareWarning size={16} color={colors.purple} />}
              onPress={() => navigation.navigate('Complaints')}
            />
          </View>
        )}

        {/* ========================================================================= */}
        {/* UNIFIED TIME FILTER (SEGMENTED PILLS): HARIAN, MINGGUAN, BULANAN         */}
        {/* ========================================================================= */}
        <View style={styles.timeFilterContainer}>
          <View style={styles.filterTitleRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.filterTitleText, { color: colors.textSecondary }]}>
                RENTANG WAKTU ANALISIS
              </Text>
            </View>
            {filterLoading && (
              <View style={styles.filterLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.filterLoadingText, { color: colors.primary }]}>
                  Sinkronisasi...
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.segmentedTrack,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {TIME_PERIODS.map((periodItem) => {
              const isSelected = selectedPeriod === periodItem.id;
              return (
                <Pressable
                  key={periodItem.id}
                  onPress={() => {
                    if (periodItem.id === 'custom') {
                      setSelectedPeriod('custom');
                      setCalendarModalVisible(true);
                    } else {
                      handlePeriodChange(periodItem.id);
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${periodItem.label}`}
                  style={({ pressed }) => [
                    styles.segmentedPill,
                    isSelected && [
                      styles.segmentedPillActive,
                      {
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                      },
                    ],
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {periodItem.id === 'custom' && (
                      <Calendar
                        size={14}
                        color={isSelected ? '#FFFFFF' : colors.primary}
                        style={{ marginRight: 5 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.segmentedPillLabel,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {periodItem.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Dynamic Active Custom Date Range Badge (Date to Date) */}
          {selectedPeriod === 'custom' && (
            <Pressable
              onPress={() => setCalendarModalVisible(true)}
              style={({ pressed }) => [
                styles.activeRangeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? 'rgba(37, 99, 235, 0.4)' : 'rgba(37, 99, 235, 0.3)',
                },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Buka Kalender Rentang Tanggal"
            >
              <View style={styles.activeRangeLeft}>
                <View style={[styles.activeRangeIconBox, { backgroundColor: colors.primary + '18' }]}>
                  <CalendarDays size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activeRangeMicro, { color: colors.textSecondary }]}>
                    RENTANG TERPILIH (DATE TO DATE)
                  </Text>
                  <Text style={[styles.activeRangeDateText, { color: colors.textPrimary }]}>
                    {formatPrettyRange(customStartDate, customEndDate)}
                  </Text>
                </View>
              </View>

              <View style={[styles.changeRangeBtn, { backgroundColor: colors.primary + '18' }]}>
                <SlidersHorizontal size={13} color={colors.primary} style={{ marginRight: 5 }} />
                <Text style={[styles.changeRangeBtnText, { color: colors.primary }]}>
                  Ubah Tanggal
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Section 2: Statistical Process Control (p-Chart) */}
        <SpcControlChart
          spcData={spcData}
          loading={loading || filterLoading}
          period={selectedPeriod}
          selectedDefect={selectedDefect}
          onSelectDefect={handleSelectDefect}
        />

        {/* Section 3: Random Forest AI Action Button (Hanya tampil jika ada temuan cacat / anomali riil) */}
        {(() => {
          const hasData =
            Array.isArray(spcData?.points) &&
            spcData.points.length > 0 &&
            Number(spcData?.totalProduced || 0) > 0;
          const isStratified = selectedDefect && selectedDefect !== 'ALL';
          const topDefectName = spcData?.topAnomaly?.topDefect;
          const hasAnyDefect = isStratified || Boolean(topDefectName) || Number(spcData?.totalNg || 0) > 0;

          // Jangan tampilkan tombol mitigasi AI jika belum ada data inspeksi atau kondisi pabrik Zero Defect
          if (!hasData || !hasAnyDefect) {
            return null;
          }

          const activeDefectForAi = isStratified
            ? selectedDefect
            : (topDefectName || 'Cacat Dominan');
          const activeProcessForAi = spcData?.topAnomaly?.process || 'Stamping';

          return (
            <View style={styles.rfActionContainer}>
              <SpringButton
                title={
                  spcData?.status === 'OUT-OF-CONTROL'
                    ? `🚨 Mitigasi Cepat AI (Out-of-Control: ${activeDefectForAi})`
                    : `⚡ Rekomendasi Solusi AI untuk: ${activeDefectForAi}`
                }
                variant="gradient"
                size="large"
                loading={rfLoading}
                gradientColors={
                  spcData?.status === 'OUT-OF-CONTROL'
                    ? ['#DC2626', '#EA580C', '#B91C1C']
                    : ['#2563EB', '#6366F1', '#7C3AED']
                }
                onPress={() =>
                  handleOpenRfPrediction(activeDefectForAi, activeProcessForAi)
                }
                style={styles.rfButton}
              />
              <Text style={[styles.rfButtonCaption, { color: colors.textMuted }]}>
                {spcData?.status === 'OUT-OF-CONTROL'
                  ? `Analisis mitigasi deviasi proses untuk: ${activeDefectForAi} (${activeProcessForAi})`
                  : `Optimasi proses otomatis berbasis model Random Forest & SOP Standard untuk ${activeDefectForAi}`}
              </Text>
            </View>
          );
        })()}

        {/* Section 4: Status Produksi Mesin (Operator) vs Status Kualitas Mesin (Staff QC) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {getMachineSectionTitle()}
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
            {getMachineSectionSubtitle()}
          </Text>
        </View>

        <View style={styles.dailyProdList}>
          {dailyProdData.length > 0 ? (
            dailyProdData.map((machine) => {
              const grossNum = Number(machine.grossProduced ?? machine.produced ?? 0);
              const ngNum = Number(machine.totalNg || 0);
              const netOkNum = Number(machine.netProduced ?? Math.max(0, grossNum - ngNum));
              const targetNum = Number(machine.target || 0);
              const varianceNum = Number(machine.variance ?? (netOkNum - targetNum));

              // Tampilan Khusus Staff QC (Monitoring Tingkat Cacat & Performa Kualitas)
              if (isStaffQc) {
                const machineDefectRate = grossNum > 0 ? Number(((ngNum / grossNum) * 100).toFixed(1)) : 0;
                const isQualityGood = ngNum === 0 || machineDefectRate <= 2.0;

                const qcStatusColor = isQualityGood ? colors.success : colors.critical;
                const qcStatusBg = isQualityGood ? colors.success + '1A' : colors.critical + '1A';
                const qcStatusBorder = isQualityGood ? colors.success + '40' : colors.critical + '40';
                const qcStatusText = isQualityGood ? 'Kualitas Baik' : 'Perlu Investigasi';
                const yieldPercent = grossNum > 0 ? Number(((netOkNum / grossNum) * 100).toFixed(1)) : 100;

                return (
                  <View
                    key={machine.id}
                    style={[
                      styles.machineCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    {/* Header: Nama Mesin, Line & Proses, Lencana Status Kualitas */}
                    <View style={styles.machineTop}>
                      <View style={styles.machineInfo}>
                        <ShieldCheck size={18} color={qcStatusColor} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1, marginRight: 6 }}>
                          <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {machine.machineName}
                          </Text>
                          <Text style={[styles.machineProcess, { color: colors.textSecondary }]} numberOfLines={1}>
                            {machine.process}
                          </Text>
                        </View>
                      </View>

                      {/* Lencana Status Kualitas (Kualitas Baik vs Perlu Investigasi) */}
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: qcStatusBg,
                            borderColor: qcStatusBorder,
                          },
                        ]}
                      >
                        {isQualityGood ? (
                          <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
                        ) : (
                          <AlertTriangle size={12} color={colors.critical} style={{ marginRight: 4 }} />
                        )}
                        <Text style={[styles.statusPillText, { color: qcStatusColor }]}>
                          {qcStatusText}
                        </Text>
                      </View>
                    </View>

                    {/* 4 Kolom Metrik Kualitas: Output Mesin, Temuan NG, Defect Rate, Produk Lolos */}
                    <View style={[styles.machineStatsRow, { borderTopColor: colors.border }]}>
                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Output Mesin</Text>
                        <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                          {grossNum.toLocaleString('id-ID')}
                          <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                        </Text>
                      </View>

                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          {selectedDefect && selectedDefect !== 'ALL' ? `NG (${selectedDefect})` : 'Temuan NG'}
                        </Text>
                        <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                          {ngNum.toLocaleString('id-ID')}
                          <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                        </Text>
                      </View>

                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Defect Rate</Text>
                        <Text style={[styles.statVal, { color: colors.textPrimary, fontWeight: '800' }]}>
                          {machineDefectRate}%
                        </Text>
                      </View>

                      <View style={styles.statCol}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Produk Lolos</Text>
                        <Text style={[styles.statVal, { color: colors.textPrimary, fontWeight: '800' }]}>
                          {netOkNum.toLocaleString('id-ID')}
                          <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Quality Yield & Tolerance Bar */}
                    <View style={styles.machineProgressWrapper}>
                      <View
                        style={[
                          styles.machineProgressBarTrack,
                          { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                        ]}
                      >
                        <View
                          style={[
                            styles.machineProgressBarFill,
                            {
                              width: `${Math.min(Math.max(yieldPercent, 0), 100)}%`,
                              backgroundColor: qcStatusColor,
                            },
                          ]}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.machineEfficiencyText, { color: colors.textPrimary }]}>
                          {yieldPercent}% Yield Mutu <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>(Defect: {machineDefectRate}%)</Text>
                        </Text>
                        <Text style={{ fontSize: typography.sizes.micro, color: colors.textSecondary, fontWeight: '600' }}>
                          Batas Toleransi: maks. 2.0%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }

              // Tampilan Eksisting untuk Operator Produksi (Target vs Aktual)
              const isOnTarget = machine.status === 'On Target';
              const statusColor = isOnTarget ? colors.success : colors.critical;
              const statusBg = isOnTarget ? colors.success + '1A' : colors.critical + '1A';
              const statusBorder = isOnTarget ? colors.success + '40' : colors.critical + '40';

              const varianceBadgeText = isOnTarget
                ? (varianceNum > 0 ? `On Target (+${varianceNum} pcs)` : 'On Target')
                : `Below Target (${varianceNum} pcs)`;

              return (
                <View
                  key={machine.id}
                  style={[
                    styles.machineCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.machineTop}>
                    <View style={styles.machineInfo}>
                      <Activity size={18} color={statusColor} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {machine.machineName}
                        </Text>
                        <Text style={[styles.machineProcess, { color: colors.textSecondary }]} numberOfLines={1}>
                          {machine.process}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: statusBg,
                          borderColor: statusBorder,
                        },
                      ]}
                    >
                      {isOnTarget ? (
                        <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
                      ) : (
                        <AlertTriangle size={12} color={colors.critical} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.statusPillText, { color: statusColor }]}>
                        {varianceBadgeText}
                      </Text>
                    </View>
                  </View>

                  {/* 4 Transparent Production Metrics: Target, Gross, NG, Net OK */}
                  <View style={[styles.machineStatsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                        {targetNum.toLocaleString('id-ID')}
                        <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                      </Text>
                    </View>

                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gross</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                        {grossNum.toLocaleString('id-ID')}
                        <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                      </Text>
                    </View>

                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cacat (NG)</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                        {ngNum > 0 ? `-${ngNum.toLocaleString('id-ID')}` : '0'}
                        <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                      </Text>
                    </View>

                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Produk OK</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary, fontWeight: '800' }]}>
                        {netOkNum.toLocaleString('id-ID')}
                        <Text style={[styles.statUnitInline, { color: colors.textSecondary }]}> pcs</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Net Efficiency Progress Bar */}
                  <View style={styles.machineProgressWrapper}>
                    <View
                      style={[
                        styles.machineProgressBarTrack,
                        { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                      ]}
                    >
                      <View
                        style={[
                          styles.machineProgressBarFill,
                          {
                            width: `${Math.min(Math.max(machine.efficiency || 0, 0), 100)}%`,
                            backgroundColor: statusColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.machineEfficiencyText, { color: colors.textPrimary }]}>
                      {machine.efficiency}% Efisiensi Bersih
                    </Text>
                  </View>
                </View>
              );
            })
          ) : filterLoading ? (
            <View style={{ gap: 12, paddingVertical: 8 }}>
              <SkeletonLoader width="100%" height={120} borderRadius={16} />
              <SkeletonLoader width="100%" height={120} borderRadius={16} />
            </View>
          ) : (
            <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.cardSubtle }]}>
              <Factory size={30} color={colors.textSecondary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                {selectedDefect && selectedDefect !== 'ALL'
                  ? `Tidak Ada Mesin Terkena Cacat "${selectedDefect}"`
                  : isStaffQc
                  ? 'Belum Ada Data Kualitas Mesin pada Periode Ini'
                  : 'Belum Ada Aktivitas Produksi pada Periode Ini'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {selectedDefect && selectedDefect !== 'ALL'
                  ? `Seluruh lini mesin beroperasi bersih tanpa temuan cacat ${selectedDefect} pada periode ${selectedPeriod === 'monthly' ? '30 hari' : selectedPeriod === 'weekly' ? '7 hari' : 'hari ini'} (Zero Defect).`
                  : isStaffQc
                  ? `Data performa mutu dan defect rate per mesin (${selectedPeriod === 'monthly' ? '30 hari' : selectedPeriod === 'weekly' ? '14 hari' : '7 hari'}) akan muncul setelah ada catatan produksi atau inspeksi QC.`
                  : `Data mesin dan pencapaian target (${selectedPeriod === 'monthly' ? '30 hari' : selectedPeriod === 'weekly' ? '14 hari' : '7 hari'}) akan muncul setelah Anda mencatat hasil produksi.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Random Forest AI Modal */}
      <RfModal
        visible={rfModalVisible}
        onClose={() => setRfModalVisible(false)}
        defectName={
          selectedDefect && selectedDefect !== 'ALL'
            ? selectedDefect
            : (topAnomaly?.topDefect || 'Cacat Dominan')
        }
        process={topAnomaly?.process || 'Stamping'}
        predictionData={rfPrediction}
      />

      {/* Pop-up Modal Kalender Rentang Tanggal (Date to Date) */}
      <CalendarRangeModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        onApply={handleApplyCalendarRange}
        initialStartDate={customStartDate}
        initialEndDate={customEndDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  sectionMeta: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    lineHeight: 18,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rfActionContainer: {
    marginVertical: 10,
  },
  rfButton: {
    width: '100%',
    minHeight: 52,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  rfButtonCaption: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  dailyProdList: {
    gap: 12,
  },
  machineCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  machineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  machineName: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
  },
  machineProcess: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 28,
  },
  statusPillText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  machineStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  statUnitInline: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  machineProgressWrapper: {
    marginTop: 12,
    gap: 6,
  },
  machineProgressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  machineProgressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  machineEfficiencyText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  // Unified Time Filter Segmented Tabs
  timeFilterContainer: {
    marginVertical: 14,
  },
  filterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  filterTitleText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterLoadingText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  segmentedTrack: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 4,
    gap: 6,
    minHeight: 46,
  },
  segmentedPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 38,
    borderRadius: 9,
  },
  segmentedPillActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedPillLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  activeRangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 10,
  },
  activeRangeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  activeRangeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeRangeMicro: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activeRangeDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  changeRangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeRangeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

export default DashboardScreen;
