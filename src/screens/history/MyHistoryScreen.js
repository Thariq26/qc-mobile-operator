import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import {
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  X,
  Calendar,
  AlertCircle,
  FileCheck2,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { defectService } from '../../api/services/defectService';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

export const MyHistoryScreen = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [historyList, setHistoryList] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('today'); // 'today' | 'week' | 'all'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fullscreen Image Preview Modal
  const [previewImageUri, setPreviewImageUri] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await defectService.getHistory(filterPeriod, user?.username, user?.role);
      setHistoryList(data);
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

  const totalNgCount = historyList.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const renderHistoryItem = ({ item, index }) => {
    const isCritical =
      item.defectName === 'Gompal' || item.defectName === 'Keropos' || item.defectName === 'Retak Tarik';

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
        {/* Card Header: Part Number + Cloud Status */}
        <View style={styles.cardHeader}>
          <View style={styles.partInfoRow}>
            <View style={[styles.partBadge, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '40' }]}>
              <Text style={[styles.partBadgeText, { color: colors.primary }]}>
                {item.partNumber}
              </Text>
            </View>
            <Text style={[styles.partNameText, { color: colors.textPrimary }]}>
              {item.partName}
            </Text>
          </View>

          <View style={[styles.cloudStatusPill, { backgroundColor: colors.success + '1A' }]}>
            <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.cloudStatusText, { color: colors.success }]}>
              Cloud
            </Text>
          </View>
        </View>

        {/* Card Body: Defect, Process, Qty */}
        <View style={styles.cardBody}>
          <View style={styles.defectTagRow}>
            <View
              style={[
                styles.defectNameBadge,
                {
                  backgroundColor: isCritical ? colors.critical + '1A' : colors.warning + '1A',
                  borderColor: isCritical ? colors.critical + '40' : colors.warning + '40',
                },
              ]}
            >
              <Text
                style={[
                  styles.defectNameText,
                  { color: isCritical ? colors.critical : colors.warning },
                ]}
              >
                {item.defectName}
              </Text>
            </View>
            <Text style={[styles.processText, { color: colors.textSecondary }]}>
              {item.proses} • {item.namaMesin || 'Amada Press 01'}
            </Text>
          </View>

          <View style={styles.quantityBox}>
            <Text style={[styles.qtyNumber, { color: colors.critical }]}>
              {item.quantity}
            </Text>
            <Text style={[styles.qtyUnit, { color: colors.textSecondary }]}>pcs NG</Text>
          </View>
        </View>

        {/* Remarks / Location */}
        {item.remarks ? (
          <View style={[styles.remarksBox, { backgroundColor: colors.cardSubtle }]}>
            <Text style={[styles.remarksText, { color: colors.textSecondary }]}>
              "{item.remarks}"
            </Text>
          </View>
        ) : null}

        {/* Card Footer: Timestamp, Shift, Photo Thumbnail */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.metaRow}>
            <Clock size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {item.defectDate} • {item.time} ({item.shift})
            </Text>
          </View>

          {item.photoUrl ? (
            <Pressable
              onPress={() => setPreviewImageUri(item.photoUrl)}
              style={[styles.photoThumbnailBtn, { borderColor: colors.primary }]}
            >
              <Image source={{ uri: item.photoUrl }} style={styles.photoThumbnail} />
              <Text style={[styles.photoLabel, { color: colors.primary }]}>Foto</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      {/* History Summary Header Banner */}
      <View style={[styles.summaryBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.screenHeading, { color: colors.textPrimary }]}>
              RIWAYAT INPUT SAYA
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              Operator: {user?.fullName || 'Budi Santoso'}
            </Text>
          </View>

          <View style={[styles.statBadge, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Text style={[styles.statBadgeLabel, { color: colors.textMuted }]}>TOTAL CACAT</Text>
            <Text style={[styles.statBadgeValue, { color: colors.critical }]}>
              {totalNgCount} pcs
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsContainer}>
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'all', label: 'Semua Riwayat' },
          ].map((tab) => {
            const isSelected = filterPeriod === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilterPeriod(tab.id)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.cardSubtle,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
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
      </View>

      {/* List / Loading / Empty States */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={140} borderRadius={16} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={140} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
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
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.success + '1A', borderColor: colors.success + '40' }]}>
                <FileCheck2 size={44} color={colors.success} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Belum ada catatan cacat pada periode ini
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Lini perakitan berjalan sempurna tanpa cacat produk. Pertahankan standar kualitas zero-defect!
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryBanner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  statBadgeLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
  },
  statBadgeValue: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '900',
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: typography.sizes.micro + 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loaderContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  partInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  partBadgeText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  partNameText: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '700',
  },
  cloudStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cloudStatusText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  defectTagRow: {
    flex: 1,
  },
  defectNameBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  defectNameText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  processText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
  },
  quantityBox: {
    alignItems: 'flex-end',
  },
  qtyNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  qtyUnit: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  remarksBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  remarksText: {
    fontSize: typography.sizes.caption,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: typography.sizes.caption,
  },
  photoThumbnailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoThumbnail: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 4,
  },
  photoLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: typography.sizes.body,
    textAlign: 'center',
    lineHeight: 18,
  },
  imageModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: width * 0.92,
    height: width * 1.2,
  },
});

export default MyHistoryScreen;
