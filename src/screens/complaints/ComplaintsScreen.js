import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Building2,
  AlertOctagon,
  Calendar,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { complaintService } from '../../api/services/complaintService';
import { typography } from '../../theme/typography';

export const ComplaintsScreen = () => {
  const { colors, isDark } = useTheme();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.warn('Complaints fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const renderComplaintItem = ({ item }) => {
    const isHighPriority = item.status?.includes('High') || item.status?.includes('Open');
    const isInvestigating = item.status?.includes('Investigation');
    const isClosed = item.status?.includes('Closed');

    const getStatusColors = () => {
      if (isHighPriority) return { bg: colors.critical + '1A', text: colors.critical, border: colors.critical + '50' };
      if (isInvestigating) return { bg: colors.warning + '1A', text: colors.warning, border: colors.warning + '50' };
      return { bg: colors.success + '1A', text: colors.success, border: colors.success + '50' };
    };

    const statusStyle = getStatusColors();

    return (
      <View
        style={[
          styles.complaintCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Row 1: Customer PT Badge + Status */}
        <View style={styles.topRow}>
          <View style={[styles.customerBadge, { backgroundColor: colors.purple + '1A', borderColor: colors.purple + '40' }]}>
            <Building2 size={13} color={colors.purple} style={{ marginRight: 5 }} />
            <Text style={[styles.customerBadgeText, { color: colors.purple }]}>
              {item.customerName}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            {isHighPriority && <AlertOctagon size={11} color={statusStyle.text} style={{ marginRight: 3 }} />}
            {isInvestigating && <AlertTriangle size={11} color={statusStyle.text} style={{ marginRight: 3 }} />}
            {isClosed && <CheckCircle2 size={11} color={statusStyle.text} style={{ marginRight: 3 }} />}
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Row 2: Part Number & Name */}
        <View style={styles.partRow}>
          <Text style={[styles.partNumber, { color: colors.primary }]}>
            {item.partNumber}
          </Text>
          <Text style={[styles.partName, { color: colors.textPrimary }]}>
            • {item.partName}
          </Text>
        </View>

        {/* Row 3: Problem Description Box */}
        <View style={[styles.problemBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
          <View style={styles.problemHeader}>
            <AlertOctagon size={14} color={colors.critical} style={{ marginRight: 5 }} />
            <Text style={[styles.problemTitle, { color: colors.critical }]}>
              RINCIAN KERUSAKAN DI CUSTOMER:
            </Text>
          </View>
          <Text style={[styles.problemText, { color: colors.textPrimary }]}>
            {item.problemDescription}
          </Text>
        </View>

        {/* Row 4: Action Plan / Countermeasure */}
        {item.actionPlan ? (
          <View style={[styles.actionPlanBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <View style={styles.problemHeader}>
              <Wrench size={14} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.actionPlanTitle, { color: colors.primary }]}>
                TINDAKAN PERBAIKAN (COUNTERMEASURE):
              </Text>
            </View>
            <Text style={[styles.actionPlanText, { color: colors.textSecondary }]}>
              {item.actionPlan}
            </Text>
          </View>
        ) : null}

        {/* Row 5: Meta Footer (Lot Number, Return Qty, Date) */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>LOT NO:</Text>
            <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{item.lotNumber}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>RETUR:</Text>
            <Text style={[styles.metaVal, { color: colors.critical, fontWeight: '900' }]}>
              {item.defectQuantity} pcs
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>TANGGAL:</Text>
            <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{item.complaintDate}</Text>
          </View>
        </View>
      </View>
    );
  };

  const activeCount = complaints.filter(
    (c) => !c.status?.toLowerCase().includes('closed')
  ).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      {/* Header Awareness Banner */}
      <View style={[styles.banner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.bannerTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              KOMPLAIN CUSTOMER
            </Text>
            <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              Customer Awareness & Mutu • Lini PT GMP
            </Text>
          </View>

          <View style={[styles.countBadge, { backgroundColor: colors.purple + '20', borderColor: colors.purple }]}>
            <Text style={[styles.countText, { color: colors.purple }]}>
              {activeCount} Kasus Aktif
            </Text>
          </View>
        </View>
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          Peringatan: Seluruh operator QC wajib memperhatikan cacat berulang pada nomor part di bawah ini untuk mencegah klaim garansi.
        </Text>
      </View>

      {/* Complaints List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <SkeletonLoader height={190} borderRadius={16} style={{ marginBottom: 12 }} />
          <SkeletonLoader height={190} borderRadius={16} />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderComplaintItem}
          contentContainerStyle={[styles.listContent, complaints.length === 0 && { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <CheckCircle2 size={44} color={colors.success} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Tidak Ada Komplain Customer
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Saat ini belum ada catatan komplain customer yang aktif. Kualitas produk dalam kondisi prima!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  countText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  noticeText: {
    fontSize: typography.sizes.caption,
    lineHeight: 16,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loaderContainer: {
    padding: 16,
  },
  complaintCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  customerBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  partNumber: {
    fontSize: typography.sizes.cardHeading + 1,
    fontWeight: '900',
  },
  partName: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '700',
    marginLeft: 6,
  },
  problemBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  problemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  problemTitle: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  problemText: {
    fontSize: typography.sizes.body,
    lineHeight: 18,
    fontWeight: '600',
  },
  actionPlanBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionPlanTitle: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionPlanText: {
    fontSize: typography.sizes.caption + 1,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '700',
    marginRight: 4,
  },
  metaVal: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ComplaintsScreen;
