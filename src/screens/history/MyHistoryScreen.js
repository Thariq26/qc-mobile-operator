import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  RefreshControl,
  Modal,
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
  X,
  Calendar,
  AlertCircle,
  WifiOff,
  ClipboardCheck,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { defectService } from '../../api/services/defectService';
import { ProductionHistoryScreen } from '../production/ProductionHistoryScreen';
import { formatIndonesianDate } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

/**
 * MyHistoryScreen: Riwayat Temuan Cacat NG
 * Tampilan distandarisasi 100% selaras dengan Riwayat Produksi:
 * - Admin Dual-History Switcher ([Produksi] vs [Cacat NG])
 * - Screen Header Bar (Judul & Subjudul)
 * - Segmented Filter Bar (Hari Ini | 7 Hari Terakhir | Semua Rekaman)
 * - Search Bar Pencarian Realtime
 * - KPI Mini Summary Ribbon (Total NG, Kasus, Kritis, Mesin Terdampak)
 * - Industrial Card Standard (Header Mesin, Part & Proses, Grid Metrik 3 Kolom, Remarks, Meta Footer)
 */
export const MyHistoryScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, isAdmin } = useAuth();

  // Mode Riwayat khusus Admin: 'production' | 'defect'
  const [adminTab, setAdminTab] = useState('production');

  const [historyList, setHistoryList] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('today'); // 'today' | 'week' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fullscreen Image Preview Modal
  const [previewImageUri, setPreviewImageUri] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await defectService.getHistory(filterPeriod, user?.username, user?.role);
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('History fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterPeriod, user?.username, user?.role]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // Filter historyList by search query
  const filteredHistoryList = historyList.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMachine = (item.namaMesin || item.machineName || '').toLowerCase().includes(q);
      const matchPartNum = (item.partNumber || '').toLowerCase().includes(q);
      const matchPartName = (item.partName || '').toLowerCase().includes(q);
      const matchDefect = (item.defectName || '').toLowerCase().includes(q);
      const matchProcess = (item.proses || item.processName || '').toLowerCase().includes(q);
      const matchShift = (item.shift || '').toLowerCase().includes(q);
      if (!matchMachine && !matchPartNum && !matchPartName && !matchDefect && !matchProcess && !matchShift) {
        return false;
      }
    }
    return true;
  });

  // Summary Metrics dari data yang terfilter
  const totalNgCount = filteredHistoryList.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const criticalCount = filteredHistoryList
    .filter((item) => item.defectName === 'Gompal' || item.defectName === 'Keropos' || item.defectName === 'Retak Tarik')
    .reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const affectedMachines = new Set(
    filteredHistoryList.map((item) => item.namaMesin || item.machineName).filter(Boolean)
  );
  const affectedMachinesCount = affectedMachines.size;

  const renderHistoryItem = ({ item }) => {
    const isCritical =
      item.defectName === 'Gompal' || item.defectName === 'Keropos' || item.defectName === 'Retak Tarik';
    const formattedDate = item.defectDate ? formatIndonesianDate(item.defectDate) : 'Hari Ini';

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
        {/* Card Header: Machine Name + Line Badge + Sync Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.machineTitleRow}>
            <Factory size={18} color={colors.warning} style={{ marginRight: 6 }} />
            <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.namaMesin || item.machineName || 'Amada Press 01'}
            </Text>
            {(item.line || item.machineLine) && (
              <View style={[styles.lineBadge, { backgroundColor: colors.warning + '18' }]}>
                <Text style={[styles.lineBadgeText, { color: colors.warning }]}>
                  {item.line || item.machineLine}
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
              {item.proses || item.processName || 'Stamping'}
            </Text>
          </View>
        </View>

        {/* 3 Metrics Columns: Jenis Cacat, Jumlah NG, Foto Bukti */}
        <View style={[styles.metricsGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={[styles.metricCol, { flex: 1.3 }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Jenis Cacat</Text>
            <View
              style={[
                styles.defectBadgeSmall,
                {
                  backgroundColor: isCritical ? colors.critical + '18' : colors.warning + '18',
                  borderColor: isCritical ? colors.critical + '40' : colors.warning + '40',
                },
              ]}
            >
              <Text
                style={[
                  styles.defectBadgeSmallText,
                  { color: isCritical ? colors.critical : colors.warning },
                ]}
                numberOfLines={1}
              >
                {item.defectName}
              </Text>
            </View>
          </View>

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Jumlah NG</Text>
            <Text style={[styles.metricVal, { color: colors.critical, fontWeight: '900' }]}>
              {item.quantity ? `-${item.quantity}` : '0'}
            </Text>
            <Text style={[styles.metricUnit, { color: colors.critical }]}>pcs</Text>
          </View>

          <View style={[styles.metricCol, { flex: 1.1 }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Bukti Foto</Text>
            {item.photoUrl ? (
              <Pressable
                onPress={() => setPreviewImageUri(item.photoUrl)}
                hitSlop={6}
                style={[styles.photoPillBtn, { backgroundColor: colors.primary + '18', borderColor: colors.primary }]}
              >
                <Image source={{ uri: item.photoUrl }} style={styles.photoMiniThumb} />
                <Text style={[styles.photoPillText, { color: colors.primary }]}>Foto</Text>
              </Pressable>
            ) : (
              <Text style={[styles.metricVal, { color: colors.textMuted, fontSize: 13, marginTop: 4 }]}>
                Tanpa Foto
              </Text>
            )}
          </View>
        </View>

        {/* Remarks / Catatan Analis jika ada */}
        {item.remarks ? (
          <View style={[styles.remarksBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.remarksText, { color: colors.textSecondary }]}>
              "{item.remarks}"
            </Text>
          </View>
        ) : null}

        {/* Card Meta Footer: Tanggal, Shift, Operator/QC, Jam */}
        <View style={[styles.cardMetaFooter, { borderTopColor: colors.border }]}>
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

          <View style={[styles.footerRow, { marginTop: 6 }]}>
            <Text style={[styles.metaOperatorText, { color: colors.textMuted }]}>
              Pelapor:{' '}
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                {item.operatorName || user?.fullName || 'Staff QC'}
              </Text>
            </Text>

            <Text style={[styles.metaTimeText, { color: colors.textMuted }]}>
              Jam:{' '}
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>
                {item.time ? `${item.time} WIB` : '10:15 WIB'}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      {/* Admin Dual-History Switcher (Produksi vs Cacat NG) */}
      {isAdmin && (
        <View
          style={[
            styles.adminSegmentWrapper,
            { backgroundColor: colors.cardSubtle, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => setAdminTab('production')}
            accessibilityRole="tab"
            accessibilityState={{ selected: adminTab === 'production' }}
            style={[
              styles.adminSegmentBtn,
              adminTab === 'production' && [
                styles.adminSegmentBtnActive,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            <Factory
              size={16}
              color={adminTab === 'production' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.adminSegmentText,
                {
                  color: adminTab === 'production' ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: adminTab === 'production' ? '800' : '600',
                },
              ]}
            >
              Produksi
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setAdminTab('defect')}
            accessibilityRole="tab"
            accessibilityState={{ selected: adminTab === 'defect' }}
            style={[
              styles.adminSegmentBtn,
              adminTab === 'defect' && [
                styles.adminSegmentBtnActive,
                { backgroundColor: colors.critical, borderColor: colors.critical },
              ],
            ]}
          >
            <AlertTriangle
              size={16}
              color={adminTab === 'defect' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.adminSegmentText,
                {
                  color: adminTab === 'defect' ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: adminTab === 'defect' ? '800' : '600',
                },
              ]}
            >
              Cacat NG
            </Text>
          </Pressable>
        </View>
      )}

      {/* Konten Riwayat: Produksi (Khusus Admin Tab Produksi) vs Cacat NG */}
      {isAdmin && adminTab === 'production' ? (
        <ProductionHistoryScreen navigation={navigation} hideHeader={true} />
      ) : (
        <View style={styles.content}>
          {/* Top Header Bar (Identik dengan Produksi) */}
          <View style={styles.screenHeader}>
            <View>
              <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                {isAdmin ? 'RIWAYAT CACAT (NG) PRODUK' : 'RIWAYAT TEMUAN CACAT'}
              </Text>
              <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                {isAdmin
                  ? 'Rekap seluruh temuan cacat part, parameter mesin, dan foto inspeksi QC'
                  : 'Catatan temuan cacat dan foto inspeksi kualitas produk Anda'}
              </Text>
            </View>
          </View>

          {/* Period Selector Tabs: Hari Ini | 7 Hari | Semua (Identik dengan Produksi) */}
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

          {/* Search Bar (Identik dengan Produksi) */}
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari mesin, nomor part, jenis cacat, shift..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* KPI Mini Summary Ribbon (Identik dengan Produksi) */}
          <View style={styles.summaryRibbon}>
            <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Total NG</Text>
              <Text style={[styles.summaryPillVal, { color: colors.critical }]}>
                {totalNgCount.toLocaleString('id-ID')} pcs
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Kasus</Text>
              <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
                {filteredHistoryList.length} lot
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Kritis</Text>
              <Text style={[styles.summaryPillVal, { color: colors.critical }]}>
                {criticalCount.toLocaleString('id-ID')} pcs
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <Text style={[styles.summaryPillLabel, { color: colors.textSecondary }]}>Mesin</Text>
              <Text style={[styles.summaryPillVal, { color: colors.textPrimary }]}>
                {affectedMachinesCount} Mesin
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
              data={filteredHistoryList}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderHistoryItem}
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
                    Belum Ada Data Temuan Cacat
                  </Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    {searchQuery
                      ? 'Tidak ada rekaman cacat yang sesuai dengan kata kunci pencarian.'
                      : 'Lini perakitan berjalan sempurna tanpa cacat produk pada periode ini. Pertahankan standar kualitas zero-defect!'}
                  </Text>
                </View>
              }
            />
          )}

          {/* Fullscreen Image Preview Modal */}
          <Modal
            visible={!!previewImageUri}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewImageUri(null)}
          >
            <View style={styles.imageModalRoot}>
              <Pressable
                onPress={() => setPreviewImageUri(null)}
                style={styles.modalCloseButton}
                hitSlop={12}
              >
                <X size={26} color="#FFFFFF" />
              </Pressable>
              {previewImageUri ? (
                <Image
                  source={{ uri: previewImageUri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </Modal>
        </View>
      )}
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
  adminSegmentBtnActive: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  defectBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 3,
    alignSelf: 'center',
  },
  defectBadgeSmallText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  photoPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 3,
  },
  photoMiniThumb: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 4,
  },
  photoPillText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  remarksBox: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  remarksText: {
    fontSize: typography.sizes.caption,
    fontStyle: 'italic',
  },
  cardMetaFooter: {
    marginTop: 2,
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
  imageModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  fullImage: {
    width: width - 32,
    height: width * 1.2,
    borderRadius: 12,
  },
});

export default MyHistoryScreen;
