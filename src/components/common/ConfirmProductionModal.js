import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Factory,
  Calendar,
  User,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { formatIndonesianDate } from '../../utils/dateFormatter';

/**
 * ConfirmProductionModal: Modal Konfirmasi Sebelum Simpan Data Produksi
 * Menyajikan ringkasan hasil target vs aktual per mesin sebelum disinkronkan ke database.
 */
export const ConfirmProductionModal = ({
  visible,
  onClose,
  onConfirm,
  submitting = false,
  data = {},
}) => {
  const { colors, isDark } = useTheme();

  const {
    productionDate = '',
    selectedShift = 'Shift 1',
    operatorName = '',
    items = [],
  } = data;

  const totalTarget = items.reduce((acc, it) => acc + (Number(it.targetQuantity) || 0), 0);
  const totalProduced = items.reduce((acc, it) => acc + (Number(it.producedQuantity) || 0), 0);
  const overallEfficiency = totalTarget > 0 ? (totalProduced / totalTarget) * 100 : 0;
  const isOnTarget = totalTarget > 0 && totalProduced >= totalTarget;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
        <Pressable
          style={styles.backdropTouch}
          onPress={() => {
            if (!submitting) onClose();
          }}
        />

        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Bar with Icon & Close Button */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.primary + '18',
                  borderColor: colors.primary + '40',
                },
              ]}
            >
              <Factory size={22} color={colors.primary} />
            </View>

            <Pressable
              onPress={onClose}
              disabled={submitting}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Konfirmasi Simpan Produksi
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Periksa kembali data pencapaian mesin shift ini sebelum disimpan ke database.
          </Text>

          {/* Context Strip: Tanggal, Shift, Operator */}
          <View
            style={[
              styles.contextStrip,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <View style={styles.contextRow}>
              <View style={styles.contextItem}>
                <Calendar size={13} color={colors.primary} style={{ marginRight: 5 }} />
                <Text style={[styles.contextText, { color: colors.textPrimary }]}>
                  {productionDate ? formatIndonesianDate(productionDate) : 'Hari Ini'}
                </Text>
              </View>
              <View style={[styles.shiftPill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.shiftPillText, { color: colors.primary }]}>
                  {selectedShift}
                </Text>
              </View>
            </View>

            <View style={[styles.contextRow, { marginTop: 6 }]}>
              <View style={styles.contextItem}>
                <User size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
                <Text style={[styles.contextText, { color: colors.textSecondary }]}>
                  Operator: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{operatorName || 'Operator'}</Text>
                </Text>
              </View>
              <Text style={[styles.itemCountText, { color: colors.textMuted }]}>
                {items.length} Mesin
              </Text>
            </View>
          </View>

          {/* Scrollable Items Breakdown */}
          <ScrollView
            style={styles.itemsScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {items.map((it, idx) => {
              const target = Number(it.targetQuantity) || 0;
              const produced = Number(it.producedQuantity) || 0;
              const eff = target > 0 ? ((produced / target) * 100).toFixed(1) : 0;
              const itemOnTarget = target > 0 && produced >= target;

              return (
                <View
                  key={it.id || idx}
                  style={[
                    styles.itemSummaryCard,
                    {
                      backgroundColor: colors.cardSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemCardTop}>
                    <View style={styles.itemHeaderLeft}>
                      <View style={[styles.itemIndexDot, { backgroundColor: colors.primary }]}>
                        <Text style={styles.itemIndexText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {it.machineName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.effPill,
                        {
                          backgroundColor: itemOnTarget ? colors.success + '18' : colors.critical + '18',
                          borderColor: itemOnTarget ? colors.success + '50' : colors.critical + '50',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.effPillText,
                          { color: itemOnTarget ? colors.success : colors.critical },
                        ]}
                      >
                        {eff}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemDetailRow}>
                    <Package size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.itemDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {it.partNumber} • {it.partName}
                    </Text>
                  </View>

                  <View style={styles.itemDetailRow}>
                    <Layers size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.itemDetailText, { color: colors.textSecondary }]}>
                      Proses: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                        {it.isCustomProcess && it.customProcess ? it.customProcess : it.processName}
                      </Text>
                    </Text>
                  </View>

                  <View style={[styles.qtyRow, { borderTopColor: colors.border }]}>
                    <View style={styles.qtyCol}>
                      <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>TARGET</Text>
                      <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>
                        {target.toLocaleString('id-ID')} <Text style={styles.qtyUnit}>pcs</Text>
                      </Text>
                    </View>
                    <View style={styles.qtyCol}>
                      <Text style={[styles.qtyLabel, { color: itemOnTarget ? colors.success : colors.critical }]}>
                        HASIL AKTUAL
                      </Text>
                      <Text style={[styles.qtyValue, { color: itemOnTarget ? colors.success : colors.critical, fontWeight: '900' }]}>
                        {produced.toLocaleString('id-ID')} <Text style={styles.qtyUnit}>pcs</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Total Summary Footer */}
          <View
            style={[
              styles.totalFooter,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>TOTAL OUTPUT SHIFT</Text>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                {totalProduced.toLocaleString('id-ID')} / {totalTarget.toLocaleString('id-ID')} pcs
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.totalLabel, { color: isOnTarget ? colors.success : colors.critical }]}>
                EFISIENSI BATCH
              </Text>
              <Text style={[styles.efficiencyBig, { color: isOnTarget ? colors.success : colors.critical }]}>
                {overallEfficiency.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={onClose}
              disabled={submitting}
              style={({ pressed }) => [
                styles.cancelButton,
                { borderColor: colors.border, backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Periksa Lagi
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={submitting}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
                submitting && { opacity: 0.6 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmButtonText}>Ya, Simpan</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.h3 || 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.caption,
    lineHeight: 18,
    marginBottom: 12,
  },
  contextStrip: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
  },
  shiftPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shiftPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemsScroll: {
    maxHeight: 220,
    marginBottom: 10,
  },
  itemSummaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  itemIndexDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  itemIndexText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  machineName: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    flex: 1,
  },
  effPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  effPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemDetailText: {
    fontSize: typography.sizes.caption - 1,
    fontWeight: '500',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 6,
    marginTop: 4,
  },
  qtyCol: {
    flex: 1,
  },
  qtyLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  qtyUnit: {
    fontSize: 10,
    fontWeight: '400',
  },
  totalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  efficiencyBig: {
    fontSize: 15,
    fontWeight: '900',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1.3,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
});

export default ConfirmProductionModal;
