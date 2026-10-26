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
  X,
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
  // First-Pass Yield (% Kualitas OK dari Total Produksi)
  const efficiencyRate = totalGross > 0
    ? Number(((totalNet / totalGross) * 100).toFixed(1))
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

        {/* Part Info Block (Bebas Truncation) */}
        <View style={[styles.partCardBlock, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <View style={styles.partTopRow}>
            <View style={[styles.partNumBadge, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.partNumText, { color: colors.primary }]}>
                {item.partNumber || 'PT-1001'}
              </Text>
            </View>
            <View style={[styles.processBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.processText, { color: colors.textSecondary }]}>
                {item.processName || item.process || 'Stamping'}
              </Text>
            </View>
          </View>
          <Text style={[styles.partNameFull, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.partName || 'Part Komponen'}
          </Text>
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
        <FlatList
          data={loading ? [] : filteredList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <View style={styles.scrollableHeaderContainer}>
              {/* 1. Top Header Bar */}
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

              {/* 2. Period Selector Tabs: Hari Ini | 7 Hari | Semua */}
              <View style={[styles.filterBar, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: 'week', label: '7 Hari' },
                  { id: 'all', label: 'Semua' },
                ].map((tab) => {
                  const isSelected = filterPeriod === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setFilterPeriod(tab.id)}
                      style={[
                        styles.filterTab,
                        isSelected && [
                          styles.filterTabActive,
                          { backgroundColor: colors.primary },
                        ],
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

              {/* 3. Search Bar */}
              <View style={[styles.searchBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                <Search size={15} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Cari mesin, part, proses, shift..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={8}
                    style={[styles.clearBtn, { backgroundColor: colors.card }]}
                  >
                    <X size={13} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>

              {/* 4. KPI Summary Banner (Satu Baris Terpadu & Rapi) */}
              <View style={[styles.summaryBar, { backgroundColor: colors.cardSubtle, borderColor: colors.border, marginBottom: 0 }]}>
                <View style={[styles.summaryCol, { borderRightColor: colors.border }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Gross</Text>
                  <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                    {totalGross.toLocaleString('id-ID')}
                  </Text>
                  <Text style={[styles.summaryUnit, { color: colors.textMuted }]}>pcs</Text>
                </View>

                <View style={[styles.summaryCol, { borderRightColor: colors.border }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>NG</Text>
                  <Text style={[styles.summaryVal, { color: colors.critical }]}>
                    {totalNg.toLocaleString('id-ID')}
                  </Text>
                  <Text style={[styles.summaryUnit, { color: colors.critical }]}>pcs</Text>
                </View>

                <View style={[styles.summaryCol, { borderRightColor: colors.border }]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Net OK</Text>
                  <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                    {totalNet.toLocaleString('id-ID')}
                  </Text>
                  <Text style={[styles.summaryUnit, { color: colors.textMuted }]}>pcs</Text>
                </View>

                <View style={[styles.summaryCol, styles.summaryColLast]}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Efisiensi</Text>
                  <Text style={[styles.summaryVal, { color: colors.success }]}>
                    {efficiencyRate}%
                  </Text>
                  <Text style={[styles.summaryUnit, { color: colors.success }]}>yield</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View style={{ gap: 12, marginTop: 4 }}>
                <SkeletonLoader height={140} borderRadius={16} />
                <SkeletonLoader height={140} borderRadius={16} />
                <SkeletonLoader height={140} borderRadius={16} />
              </View>
            ) : (
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
            )
          }
        />
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
  scrollableHeaderContainer: {
    paddingBottom: 2,
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
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginBottom: 10,
    height: 38,
  },
  filterTab: {
    flex: 1,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  filterTabActive: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  filterTabText: {
    fontSize: typography.sizes.micro + 2,
    letterSpacing: 0.2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.micro + 2,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    marginBottom: 0,
    alignItems: 'center',
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderRightWidth: 1,
  },
  summaryColLast: {
    borderRightWidth: 0,
  },
  summaryLabel: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  summaryUnit: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '600',
    marginTop: 1,
  },
  listContainer: {
    paddingBottom: 36,
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
  partCardBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  partTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  partNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  partNumText: {
    fontSize: typography.sizes.micro + 1,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  processBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  processText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  partNameFull: {
    fontSize: typography.sizes.caption + 1,
    fontWeight: '700',
    letterSpacing: 0.2,
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
