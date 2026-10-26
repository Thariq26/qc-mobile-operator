import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Factory,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Filter,
  WifiOff,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { productionService } from '../../api/services/productionService';
import { formatIndonesianDate, formatTime, getLocalDateString } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

/**
 * ProductionHistoryScreen: Riwayat Produksi Operator & Shop Floor
 * Displays detailed logs of batches, machine targets, gross vs net OK quantities, and efficiency.
 */
export const ProductionHistoryScreen = ({ navigation, hideHeader = false }) => {
  const { colors, isDark } = useTheme();
  const { user, isAdmin } = useAuth();

  const [productionList, setProductionList] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('today'); // 'today' | 'week' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProductionHistory = useCallback(async () => {
    try {
      const data = await productionService.getProductionList(user?.username, user?.role);
      setProductionList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Production history fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.username, user?.role]);

  useEffect(() => {
    fetchProductionHistory();
  }, [fetchProductionHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProductionHistory();
  };

  // Filter by period & search query
  const filteredList = productionList.filter((item) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMachine = (item.machineName || '').toLowerCase().includes(q);
      const matchPartNum = (item.partNumber || '').toLowerCase().includes(q);
      const matchPartName = (item.partName || '').toLowerCase().includes(q);
      const matchProcess = (item.processName || item.process || '').toLowerCase().includes(q);
      const matchShift = (item.shift || '').toLowerCase().includes(q);
      if (!matchMachine && !matchPartNum && !matchPartName && !matchProcess && !matchShift) {
        return false;
      }
    }

    // 2. Period Filter
    if (filterPeriod === 'today') {
      const today = getLocalDateString();
      const itemDate = item.productionDate ? String(item.productionDate).split('T')[0] : '';
      return itemDate === today;
    } else if (filterPeriod === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const itemDateStr = item.productionDate ? String(item.productionDate).split('T')[0] : '';
      return itemDateStr >= getLocalDateString(sevenDaysAgo);
    }

    return true;
  });

  // Summary Metrics from filtered list
  const totalGross = filteredList.reduce((acc, i) => acc + (Number(i.producedQuantity ?? i.grossProduced ?? i.produced ?? 0)), 0);
  const totalNet = filteredList.reduce((acc, i) => acc + (Number(i.netProduced ?? 0)), 0);
  const totalNg = filteredList.reduce((acc, i) => acc + (Number(i.totalNg ?? 0)), 0);
  const avgEfficiency = filteredList.length > 0
    ? Math.round(filteredList.reduce((acc, i) => acc + (Number(i.efficiency ?? 0)), 0) / filteredList.length)
    : 100;

  const renderItem = ({ item }) => {
    const isOnTarget = item.status === 'On Target';
    const target = Number(item.targetQuantity ?? item.target ?? 0);
    const gross = Number(item.producedQuantity ?? item.grossProduced ?? item.produced ?? 0);
    const ng = Number(item.totalNg ?? 0);
    const net = Number(item.netProduced ?? Math.max(0, gross - ng));
    const variance = Number(item.variance ?? (net - target));

    const statusColor = isOnTarget ? colors.success : colors.critical;
    const statusBg = isOnTarget ? colors.success + '18' : colors.critical + '18';
    const statusBorder = isOnTarget ? colors.success + '40' : colors.critical + '40';
    const formattedDate = formatIndonesianDate(item.productionDate);

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
        {/* Card Header: Machine Name + Status / Sync Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.machineTitleRow}>
            <Factory size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.machineName, { color: colors.textPrimary }]}>
              {item.machineName || 'Mesin Produksi'}
            </Text>
            {item.line && (
              <View style={[styles.lineBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.lineBadgeText, { color: colors.primary }]}>
                  {item.line}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {item.isOffline ? (
              <View style={[styles.syncBadge, { backgroundColor: colors.warning + '18' }]}>
                <WifiOff size={11} color={colors.warning} style={{ marginRight: 3 }} />
                <Text style={[styles.syncText, { color: colors.warning }]}>Lokal</Text>
              </View>
            ) : (
              <View style={[styles.syncBadge, { backgroundColor: colors.success + '18' }]}>
                <CheckCircle2 size={11} color={colors.success} style={{ marginRight: 3 }} />
                <Text style={[styles.syncText, { color: colors.success }]}>Cloud</Text>
              </View>
            )}
          </View>
        </View>

        {/* Part Info & Process Info */}
        <View style={styles.partRow}>
          <View style={[styles.partPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.partNumText, { color: colors.primary }]}>
              {item.partNumber || 'PT-1001'}
            </Text>
            <Text style={[styles.partNameText, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.partName || 'Part Komponen'}
            </Text>
          </View>
          <View style={[styles.processPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.processText, { color: colors.textSecondary }]}>
              {item.processName || item.process || 'Stamping'}
            </Text>
          </View>
        </View>

        {/* 4 Metrics Columns: Target, Gross, NG, Net OK */}
        <View style={[styles.metricsGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Target</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {target.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>pcs</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Gross</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {gross.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>pcs</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Cacat (NG)</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {ng > 0 ? `-${ng.toLocaleString('id-ID')}` : '0'}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>pcs</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Net OK</Text>
            <Text style={[styles.metricVal, { color: colors.textPrimary, fontWeight: '800' }]}>
              {net.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>pcs</Text>
          </View>
        </View>

        {/* Card Footer: Progress Bar + Status Badge */}
        <View style={styles.cardFooter}>
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(Math.max(item.efficiency || 0, 0), 100)}%`,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.efficiencyText, { color: colors.textPrimary }]}>
              {item.efficiency || 100}% Efisiensi
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusBorder }]}>
            {isOnTarget ? (
              <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
            ) : (
              <AlertTriangle size={12} color={colors.critical} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {isOnTarget
                ? variance > 0
                  ? `On Target (+${variance} pcs)`
                  : 'On Target'
                : `Below Target (${variance} pcs)`}
            </Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* BAGIAN BAWAH: TANGGAL LAPORAN, OPERATOR, SHIFT, DAN JAM LAPORAN          */}
        {/* ========================================================================= */}
        <View style={[styles.cardMetaFooter, { borderTopColor: colors.border }]}>
          {/* Baris 1: Tanggal Laporan & Shift */}
          <View style={styles.footerRow}>
            <View style={styles.footerDateGroup}>
              <Calendar size={13} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.footerDateText, { color: colors.textPrimary }]}>
                {formattedDate}
              </Text>
            </View>

            <View style={[styles.footerShiftPill, { backgroundColor: colors.primary + '18' }]}>
              <Clock size={11} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.footerShiftText, { color: colors.primary }]}>
                {item.shift || 'Shift 1'}
              </Text>
            </View>
          </View>

          {/* Baris 2: Operator & Jam Laporan */}
          <View style={[styles.footerRow, { marginTop: 6 }]}>
            <Text style={[styles.metaOperatorText, { color: colors.textMuted }]}>
              Operator:{' '}
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                {item.operatorName || item.createdBy || 'Operator Produksi'}
              </Text>
            </Text>

            <Text style={[styles.metaTimeText, { color: colors.textMuted }]}>
              Jam Laporan:{' '}
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
                {item.createdAt ? formatTime(item.createdAt) : (item.time ? `${item.time} WIB` : '14:22 WIB')}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideHeader && <AppHeader />}

      {/* Admin Dual-History Switcher (jika diakses langsung sebagai screen standalone) */}
      {!hideHeader && isAdmin && (
        <View
          style={[
            styles.adminSegmentWrapper,
            { backgroundColor: colors.cardSubtle, borderColor: colors.border },
          ]}
        >
          <Pressable
            style={[
              styles.adminSegmentBtn,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Factory size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[styles.adminSegmentText, { color: '#FFFFFF', fontWeight: '800' }]}>
              Produksi
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation?.navigate('History')}
            style={styles.adminSegmentBtn}
          >
            <AlertTriangle size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.adminSegmentText, { color: colors.textSecondary, fontWeight: '600' }]}>
              Cacat NG
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {/* Top Header Bar */}
        <View style={styles.screenHeader}>
          <View>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              RIWAYAT PRODUKSI
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Rekap hasil cetak mesin, target, dan produk bagus bersih
            </Text>
          </View>
        </View>

        {/* Period Selector Tabs: Hari Ini | 7 Hari | Semua */}
        <View style={[styles.filterBar, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'all', label: 'Semua Rekaman' },
          ].map((tab) => {
            const isSelected = filterPeriod === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilterPeriod(tab.id)}
                style={[
                  styles.filterTab,
                  isSelected && { backgroundColor: colors.primary },
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
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Cari mesin, nomor part, proses, shift..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        {/* KPI Mini Summary Ribbon */}
        <View style={styles.summaryRibbon}>
          <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Gross</Text>
            <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
              {totalGross.toLocaleString('id-ID')} pcs
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>NG</Text>
            <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
              {totalNg.toLocaleString('id-ID')} pcs
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Net OK</Text>
            <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
              {totalNet.toLocaleString('id-ID')} pcs
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Efisiensi</Text>
            <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
              {avgEfficiency}%
            </Text>
          </View>
        </View>

        {/* List Content */}
        {loading ? (
          <View style={{ gap: 12, marginTop: 12 }}>
            <SkeletonLoader height={140} borderRadius={16} />
            <SkeletonLoader height={140} borderRadius={16} />
            <SkeletonLoader height={140} borderRadius={16} />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Layers size={36} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  Belum Ada Data Produksi
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  {searchQuery
                    ? 'Tidak ada rekaman produksi yang sesuai dengan kata kunci pencarian.'
                    : 'Catat hasil cetak mesin harian Anda melalui menu "Input Prod" di navigasi bawah.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adminSegmentWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  adminSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  adminSegmentText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screenHeader: {
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  screenSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 4,
    marginBottom: 12,
    minHeight: 50,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  filterTabText: {
    fontSize: typography.sizes.body,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    paddingVertical: 0,
  },
  summaryRibbon: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  summaryPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  summaryPillLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  summaryPillVal: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    marginTop: 2,
  },
  listContainer: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  machineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  machineName: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
  },
  lineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  lineBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syncText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  partPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  partNumText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    marginRight: 6,
  },
  partNameText: {
    fontSize: typography.sizes.caption,
    flex: 1,
    fontWeight: '600',
  },
  processPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  processText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  shiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shiftText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  metricCol: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  metricUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    flex: 1,
    marginRight: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  efficiencyText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 28,
  },
  statusBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  cardMetaFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerDateText: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerShiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footerShiftText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  metaOperatorText: {
    fontSize: typography.sizes.caption,
  },
  metaTimeText: {
    fontSize: typography.sizes.caption,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default ProductionHistoryScreen;
