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
  User,
  ShieldCheck,
  Camera,
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
    // Resolve machine line jika belum terdefinisi
    const machineNameLower = String(item.namaMesin || item.machineName || '').toLowerCase();
    const resolvedLine =
      item.line ||
      item.machineLine ||
      (machineNameLower.includes('amada') ||
      machineNameLower.includes('komatsu') ||
      machineNameLower.includes('aida') ||
      machineNameLower.includes('chin fong')
        ? 'Stamping'
        : machineNameLower.includes('brake') || machineNameLower.includes('toyokoki')
        ? 'Bending'
        : machineNameLower.includes('welding') ||
          machineNameLower.includes('spot') ||
          machineNameLower.includes('robot')
        ? 'Welding'
        : item.proses || 'Lini Produksi');

    // Ambil metadata tingkat keparahan defect
    const isCritical =
      item.category === 'Critical' ||
      item.defectName === 'Gompal' ||
      item.defectName === 'Keropos' ||
      item.defectName === 'Retak Tarik' ||
      item.defectName === 'Double Punch';
    const category = item.category || (isCritical ? 'Critical' : 'Major');

    const formattedDate = item.defectDate ? formatIndonesianDate(item.defectDate) : 'Hari Ini';
    const ngCount = Math.abs(Number(item.quantity || 0));

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
        {/* 1. Header Mesin & Sync Status */}
        <View style={styles.cardHeader}>
          <View style={styles.machineTitleRow}>
            <Factory size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.namaMesin || item.machineName || 'Amada Press 01'}
            </Text>
            {resolvedLine ? (
              <View style={[styles.lineBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.lineBadgeText, { color: colors.primary }]}>
                  {resolvedLine}
                </Text>
              </View>
            ) : null}
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

        {/* 2. Part Info Block (Bebas Truncation) */}
        <View style={[styles.partCardBlock, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <View style={styles.partTopRow}>
            <View style={[styles.partNumBadge, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.partNumText, { color: colors.primary }]}>
                {item.partNumber || 'PT-1001'}
              </Text>
            </View>
            <View style={[styles.processBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.processText, { color: colors.textSecondary }]}>
                {item.proses || item.processName || 'Stamping'}
              </Text>
            </View>
          </View>
          <Text style={[styles.partNameFull, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.partName || 'Part Komponen'}
          </Text>
        </View>

        {/* 3. Defect & NG Highlight Tile (Lebih Praktis & Berbobot) */}
        <View
          style={[
            styles.defectHighlightRow,
            {
              backgroundColor: isCritical ? colors.critical + '0A' : colors.warning + '0A',
              borderColor: isCritical ? colors.critical + '30' : colors.warning + '30',
            },
          ]}
        >
          {/* Sisi Kiri: Jenis Cacat & Tingkat Severity */}
          <View style={styles.defectInfoCol}>
            <Text style={[styles.defectSectionLabel, { color: colors.textSecondary }]}>
              TEMUAN CACAT
            </Text>
            <View style={styles.defectTitleRow}>
              {isCritical ? (
                <AlertTriangle size={16} color={colors.critical} style={{ marginRight: 6 }} />
              ) : (
                <AlertCircle size={16} color={colors.warning} style={{ marginRight: 6 }} />
              )}
              <Text
                style={[
                  styles.defectNameText,
                  { color: isCritical ? colors.critical : colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {item.defectName || 'Defect'}
              </Text>
            </View>
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isCritical ? colors.critical + '18' : colors.warning + '18',
                  borderColor: isCritical ? colors.critical + '35' : colors.warning + '35',
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: isCritical ? colors.critical : colors.warning },
                ]}
              >
                {category} Defect
              </Text>
            </View>
          </View>

          {/* Sisi Kanan: Jumlah NG & Tombol Bukti Foto */}
          <View style={styles.defectActionCol}>
            <View
              style={[
                styles.ngCountBadge,
                {
                  backgroundColor: colors.critical + '14',
                  borderColor: colors.critical + '40',
                },
              ]}
            >
              <Text style={[styles.ngCountNumber, { color: colors.critical }]}>
                {ngCount.toLocaleString('id-ID')}
              </Text>
              <Text style={[styles.ngCountUnit, { color: colors.critical }]}>
                pcs NG
              </Text>
            </View>

            {item.photoUrl ? (
              <Pressable
                onPress={() => setPreviewImageUri(item.photoUrl)}
                hitSlop={6}
                style={[
                  styles.photoBtn,
                  {
                    backgroundColor: colors.primary + '18',
                    borderColor: colors.primary + '40',
                  },
                ]}
              >
                <Camera size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.photoBtnText, { color: colors.primary }]}>Bukti Foto</Text>
              </Pressable>
            ) : (
              <View style={[styles.noPhotoTag, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                <Text style={[styles.noPhotoText, { color: colors.textMuted }]}>Tanpa Foto</Text>
              </View>
            )}
          </View>
        </View>

        {/* 4. Remarks / Catatan Analis jika ada */}
        {item.remarks ? (
          <View
            style={[
              styles.remarksCallout,
              {
                backgroundColor: colors.cardSubtle,
                borderLeftColor: isCritical ? colors.critical : colors.primary,
              },
            ]}
          >
            <Text style={[styles.remarksText, { color: colors.textSecondary }]} numberOfLines={2}>
              "{item.remarks}"
            </Text>
          </View>
        ) : null}

        {/* 5. Clean Industrial Meta Footer: Tanggal, Shift, Jam, Operator Lini & QC */}
        <View style={[styles.cardMetaFooter, { borderTopColor: colors.border }]}>
          {/* Baris 1: Waktu & Shift */}
          <View style={styles.footerRow}>
            <View style={styles.footerDateGroup}>
              <Calendar size={13} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.footerDateText, { color: colors.textPrimary }]}>
                {formattedDate}
              </Text>
            </View>

            <View style={styles.footerTimeShiftGroup}>
              <View style={styles.footerTimeWrapper}>
                <Clock size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaTimeText, { color: colors.textSecondary }]}>
                  {item.time ? `${item.time} WIB` : '10:15 WIB'}
                </Text>
              </View>
              <View style={[styles.footerShiftPill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.footerShiftText, { color: colors.primary }]}>
                  {item.shift || 'Shift 1'}
                </Text>
              </View>
            </View>
          </View>

          {/* Baris 2: Operator Lini (Nama Utuh Tanpa Terpotong) & QC Badge */}
          <View style={[styles.footerRow, { marginTop: 7 }]}>
            <View style={styles.operatorContainer}>
              <User size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
              <Text style={[styles.metaOperatorText, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
                Operator:{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {item.operatorName || 'Operator Produksi'}
                </Text>
              </Text>
            </View>

            <View
              style={[
                styles.qcBadgePill,
                {
                  backgroundColor: colors.primary + '14',
                  borderColor: colors.primary + '35',
                },
              ]}
            >
              <ShieldCheck size={11} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.qcBadgeText, { color: colors.textSecondary }]}>
                QC:{' '}
                <Text style={{ color: colors.primary, fontWeight: '800' }}>
                  {item.createdBy || user?.fullName || user?.username || 'Staff QC'}
                </Text>
              </Text>
            </View>
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
              size={14}
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
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
            ]}
          >
            <AlertTriangle
              size={14}
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
          <FlatList
            data={loading ? [] : filteredHistoryList}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderHistoryItem}
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
                  <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                    {isAdmin ? 'RIWAYAT CACAT (NG) PRODUK' : 'RIWAYAT TEMUAN CACAT'}
                  </Text>
                  <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                    {isAdmin
                      ? 'Rekap seluruh temuan cacat part, parameter mesin, dan foto inspeksi QC'
                      : 'Catatan temuan cacat dan foto inspeksi kualitas produk Anda'}
                  </Text>
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
                    placeholder="Cari mesin, part, cacat, shift..."
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
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total NG</Text>
                    <Text style={[styles.summaryVal, { color: colors.critical }]}>
                      {totalNgCount.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.summaryUnit, { color: colors.critical }]}>pcs</Text>
                  </View>

                  <View style={[styles.summaryCol, { borderRightColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Kasus</Text>
                    <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                      {filteredHistoryList.length}
                    </Text>
                    <Text style={[styles.summaryUnit, { color: colors.textMuted }]}>lot</Text>
                  </View>

                  <View style={[styles.summaryCol, { borderRightColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Kritis</Text>
                    <Text style={[styles.summaryVal, { color: colors.critical }]}>
                      {criticalCount.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.summaryUnit, { color: colors.critical }]}>pcs</Text>
                  </View>

                  <View style={[styles.summaryCol, styles.summaryColLast]}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Mesin</Text>
                    <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
                      {affectedMachinesCount}
                    </Text>
                    <Text style={[styles.summaryUnit, { color: colors.textMuted }]}>unit</Text>
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
                    Belum Ada Data Temuan Cacat
                  </Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    {searchQuery
                      ? 'Tidak ada rekaman cacat yang sesuai dengan kata kunci pencarian.'
                      : 'Lini perakitan berjalan sempurna tanpa cacat produk pada periode ini. Pertahankan standar kualitas zero-defect!'}
                  </Text>
                </View>
              )
            }
          />

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
    marginTop: 8,
    marginBottom: 6,
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    gap: 4,
  },
  adminSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  adminSegmentBtnActive: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  adminSegmentText: {
    fontSize: typography.sizes.micro + 2,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  screenHeader: {
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: typography.sizes.body + 2,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  screenSubtitle: {
    fontSize: typography.sizes.micro + 1,
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
    marginBottom: 12,
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
  scrollableHeaderContainer: {
    paddingBottom: 2,
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
  defectHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  defectInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  defectSectionLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  defectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defectNameText: {
    fontSize: typography.sizes.body + 2,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  defectActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ngCountBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 78,
  },
  ngCountNumber: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  ngCountUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    marginTop: 1,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  photoMiniThumb: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 4,
  },
  photoBtnText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  noPhotoTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    marginTop: 6,
  },
  noPhotoText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  remarksCallout: {
    borderLeftWidth: 3.5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  remarksText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
    lineHeight: 18,
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
    fontSize: typography.sizes.caption + 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footerTimeShiftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTimeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 2,
  },
  footerShiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  footerShiftText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  operatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  qcBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  qcBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  metaOperatorText: {
    fontSize: typography.sizes.micro + 1,
  },
  metaTimeText: {
    fontSize: typography.sizes.micro + 1,
    fontWeight: '600',
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
