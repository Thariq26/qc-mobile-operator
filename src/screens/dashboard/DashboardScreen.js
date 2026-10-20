import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
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
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ParetoBar } from '../../components/dashboard/ParetoBar';
import { RfModal } from '../../components/dashboard/RfModal';
import { SpringButton } from '../../components/common/SpringButton';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { dashboardService } from '../../api/services/dashboardService';
import { aiService } from '../../api/services/aiService';
import { typography } from '../../theme/typography';
import { useObserve } from 'expo-observe';

export const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, currentShift } = useAuth();
  const { markInteractive } = useObserve();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.username?.toLowerCase() === 'admin';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paretoPeriod, setParetoPeriod] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  const [kpiData, setKpiData] = useState({
    totalProduction: 0,
    totalNg: 0,
    defectRate: 0,
    totalComplaints: 0,
  });

  const [paretoData, setParetoData] = useState([]);
  const [dailyProdData, setDailyProdData] = useState([]);

  // Random Forest Modal State
  const [rfModalVisible, setRfModalVisible] = useState(false);
  const [rfLoading, setRfLoading] = useState(false);
  const [rfPrediction, setRfPrediction] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const username = user?.username;
      const role = user?.role;
      const [summary, pareto, dailyProd] = await Promise.all([
        dashboardService.getSummary(null, null, username, role),
        dashboardService.getPareto(paretoPeriod, username, role),
        dashboardService.getDailyProduction(username, role),
      ]);

      setKpiData(summary);
      setParetoData(pareto);
      setDailyProdData(dailyProd);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [paretoPeriod, user?.username, user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!loading && markInteractive) {
      markInteractive();
    }
  }, [loading, markInteractive]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleOpenRfPrediction = async () => {
    setRfLoading(true);
    try {
      const topDefect = paretoData[0] || { defectName: 'Gompal', process: 'Blanking' };
      const prediction = await aiService.predictRfAction(topDefect.process, topDefect.defectName);
      setRfPrediction(prediction);
      setRfModalVisible(true);
    } catch (err) {
      console.warn('RF prediction error:', err);
    } finally {
      setRfLoading(false);
    }
  };

  const handleConsultAi = (defectName, process) => {
    navigation.navigate('AiChat', {
      initialPrompt: `Part mengalami defect ${defectName} pada proses ${process}. Mohon berikan panduan SOP perbaikan lengkap.`,
    });
  };

  const topDefect = paretoData[0] || { defectName: 'Gompal', process: 'Blanking' };

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
            RINGKASAN METRIK KUALITAS
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
            {isAdmin ? 'Pabrik Global • Live Synchronized' : `${currentShift || 'Shift 1'} • Operator Scoped`}
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
            {/* KPI 1: Total Produksi */}
            <KpiCard
              title="Total Produksi"
              value={kpiData.totalProduction != null ? kpiData.totalProduction.toLocaleString('id-ID') : '0'}
              unit="pcs"
              badgeText={isAdmin ? "Seluruh Lini Pabrik" : (kpiData.totalProduction > 0 ? "Tercatat di sistem" : "Belum ada produksi")}
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
              value={`${kpiData.defectRate != null ? kpiData.defectRate : 0}%`}
              badgeText={kpiData.defectRate > 2.0 ? "Di atas batas 2%" : (isAdmin ? "Target Pabrik Tercapai" : "Kualitas Baik (< 2%)")}
              badgeVariant={kpiData.defectRate > 2.0 ? "warning" : "success"}
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

        {/* Section 2: Random Forest AI Action Button */}
        {paretoData.length > 0 && (
          <View style={styles.rfActionContainer}>
            <SpringButton
              title={`⚡ Rekomendasi Solusi (Random Forest AI)`}
              variant="gradient"
              size="large"
              loading={rfLoading}
              gradientColors={['#2563EB', '#6366F1', '#7C3AED']}
              onPress={handleOpenRfPrediction}
              style={styles.rfButton}
            />
            <Text style={[styles.rfButtonCaption, { color: colors.textMuted }]}>
              Analisis otomatis untuk cacat prioritas #1: {topDefect.defectName} ({topDefect.process})
            </Text>
          </View>
        )}

        {/* Section 3: Top 5 Defect (Pareto 80/20) */}
        <View style={[styles.paretoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.paretoHeader}>
            <View style={styles.paretoTitleContainer}>
              <Text style={[styles.paretoTitle, { color: colors.textPrimary }]}>
                TOP 5 DEFECT (PARETO 80/20)
              </Text>
              <Text style={[styles.paretoSubtitle, { color: colors.textSecondary }]}>
                {isAdmin ? 'Cacat terbanyak seluruh pabrik berdasarkan volume NG' : 'Cacat terbanyak yang dicatat operator ini'}
              </Text>
            </View>

            {/* Interactive Filter Pills (Daily, Week, Monthly) */}
            <View style={[styles.filterCapsule, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              {['daily', 'weekly', 'monthly'].map((period) => {
                const isSelected = paretoPeriod === period;
                const labels = { daily: 'Daily', weekly: 'Week', monthly: 'Monthly' };
                return (
                  <Pressable
                    key={period}
                    onPress={() => setParetoPeriod(period)}
                    style={[
                      styles.filterTab,
                      isSelected && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {labels[period]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Pareto Bars */}
          {loading ? (
            <View style={{ gap: 12, marginTop: 8 }}>
              <SkeletonLoader height={32} borderRadius={8} />
              <SkeletonLoader height={32} borderRadius={8} />
              <SkeletonLoader height={32} borderRadius={8} />
              <SkeletonLoader height={32} borderRadius={8} />
              <SkeletonLoader height={32} borderRadius={8} />
            </View>
          ) : paretoData.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              {paretoData.map((item, idx) => (
                <ParetoBar
                  key={`${item.defectName}-${idx}`}
                  rank={idx + 1}
                  defectName={item.defectName}
                  process={item.process}
                  quantity={item.quantity}
                  percentage={item.percentage}
                  severity={item.severity}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.cardSubtle }]}>
              <CheckCircle2 size={30} color={colors.success} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                Tidak Ada Cacat (Zero Defect)
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Belum ada data cacat (NG) yang tercatat untuk akun ini.
              </Text>
            </View>
          )}
        </View>

        {/* Section 4: Produksi Harian Mesin (Daily Production Status) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            STATUS PRODUKSI MESIN HARI INI
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textSecondary }]}>
            {isAdmin ? 'Seluruh Mesin Pabrik • Aktual vs Target' : 'Mesin Operator • Aktual vs Target'}
          </Text>
        </View>

        <View style={styles.dailyProdList}>
          {dailyProdData.length > 0 ? (
            dailyProdData.map((machine) => {
              const isOnTarget = machine.status === 'On Target';
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
                      <Activity size={18} color={isOnTarget ? colors.success : colors.warning} style={{ marginRight: 8 }} />
                      <View>
                        <Text style={[styles.machineName, { color: colors.textPrimary }]}>
                          {machine.machineName}
                        </Text>
                        <Text style={[styles.machineProcess, { color: colors.textSecondary }]}>
                          {machine.process}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isOnTarget ? colors.success + '1A' : colors.warning + '1A',
                          borderColor: isOnTarget ? colors.success + '40' : colors.warning + '40',
                        },
                      ]}
                    >
                      {isOnTarget ? (
                        <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
                      ) : (
                        <AlertTriangle size={12} color={colors.warning} style={{ marginRight: 4 }} />
                      )}
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isOnTarget ? colors.success : colors.warning },
                        ]}
                      >
                        {machine.status}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Stats */}
                  <View style={[styles.machineStatsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>Target</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                        {machine.target?.toLocaleString('id-ID')} pcs
                      </Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>Aktual</Text>
                      <Text style={[styles.statVal, { color: colors.textPrimary }]}>
                        {machine.produced?.toLocaleString('id-ID')} pcs
                      </Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>Efisiensi</Text>
                      <Text
                        style={[
                          styles.statVal,
                          { color: isOnTarget ? colors.success : colors.warning, fontWeight: '900' },
                        ]}
                      >
                        {machine.efficiency}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.cardSubtle }]}>
              <Layers size={30} color={colors.textSecondary} style={{ marginBottom: 6 }} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                Belum Ada Aktivitas Produksi
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Data mesin dan pencapaian target akan muncul setelah Anda mencatat hasil produksi di menu Input Prod.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Random Forest AI Modal */}
      <RfModal
        visible={rfModalVisible}
        onClose={() => setRfModalVisible(false)}
        defectName={topDefect.defectName}
        process={topDefect.process}
        predictionData={rfPrediction}
        onConsultAi={handleConsultAi}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionMeta: {
    fontSize: typography.sizes.caption,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rfActionContainer: {
    marginVertical: 8,
  },
  rfButton: {
    width: '100%',
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
  },
  paretoCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 12,
    overflow: 'hidden',
  },
  paretoHeader: {
    marginBottom: 14,
  },
  paretoTitleContainer: {
    marginBottom: 10,
  },
  paretoTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  paretoSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  filterCapsule: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    width: '100%',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  filterTabText: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
  },
  dailyProdList: {
    gap: 10,
  },
  machineCard: {
    padding: 14,
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
  },
  machineName: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
  },
  machineProcess: {
    fontSize: typography.sizes.caption,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
  machineStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '600',
    marginBottom: 2,
  },
  statVal: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
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
});

export default DashboardScreen;
