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
  CheckCircle2,
  Calendar,
  User,
  Package,
  Layers,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatIndonesianDate } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';

/**
 * ConfirmProductionModal: Production Shift Confirmation Dialog
 * Desain Praktis, Kompak, & Ergonomis (Zero Duplication & Fast Visual Scan)
 */
export const ConfirmProductionModal = ({
  visible,
  onClose,
  onConfirm,
  submitting = false,
  data,
  productionDate: propDate = '',
  selectedShift: propShift = 'Shift 1',
  operatorName: propOperator = '',
  items: propItems = [],
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  // Mendukung passing via data={{ ... }} (dari InputProductionScreen) ATAU props terpisah
  const productionDate = data?.productionDate ?? propDate ?? '';
  const selectedShift = data?.selectedShift ?? propShift ?? 'Shift 1';
  const operatorName = data?.operatorName ?? propOperator ?? '';
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(propItems)
    ? propItems
    : [];

  // Aggregate Calculations
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
          {/* Header Terpadu: Icon + Title + Close Button */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: colors.primary + '18',
                    borderColor: colors.primary + '40',
                  },
                ]}
              >
                <Factory size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Konfirmasi Simpan Produksi
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Periksa pencapaian shift sebelum disimpan
                </Text>
              </View>
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
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Context Strip: Tanggal, Shift, Operator, & Total Mesin */}
          <View
            style={[
              styles.contextStrip,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            {/* Baris 1: Tanggal & Shift Pill */}
            <View style={styles.contextRow}>
              <View style={styles.contextItem}>
                <Calendar size={13} color={colors.primary} style={{ marginRight: 6 }} />
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

            {/* Baris 2: Operator Lini & Jumlah Mesin */}
            <View style={[styles.contextRow, { marginTop: 6 }]}>
              <View style={styles.contextItem}>
                <User size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.contextText, { color: colors.textSecondary }]} numberOfLines={1}>
                  Operator:{' '}
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                    {operatorName || 'Operator'}
                  </Text>
                </Text>
              </View>

              <View style={[styles.machineCountBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.machineCountText, { color: colors.textSecondary }]}>
                  {items.length} Mesin
                </Text>
              </View>
            </View>
          </View>

          {/* Scrollable Items Breakdown */}
          <ScrollView
            style={styles.itemsScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingVertical: 2 }}
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
                  {/* Item Top: Machine Name, Process & Efficiency Pill */}
                  <View style={styles.itemCardTop}>
                    <View style={styles.itemHeaderLeft}>
                      <View style={[styles.itemIndexDot, { backgroundColor: colors.primary }]}>
                        <Text style={styles.itemIndexText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.machineName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {it.machineName}
                      </Text>
                      <Text style={[styles.processTag, { color: colors.textSecondary }]}>
                        • {it.isCustomProcess && it.customProcess ? it.customProcess : it.processName || 'Proses'}
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

                  {/* Part Info */}
                  <View style={styles.itemPartRow}>
                    <Package size={12} color={colors.primary} style={{ marginRight: 5 }} />
                    <Text style={[styles.partText, { color: colors.textPrimary }]} numberOfLines={1}>
                      <Text style={{ fontWeight: '800', color: colors.primary }}>{it.partNumber}</Text> • {it.partName}
                    </Text>
                  </View>

                  {/* Target vs Actual (Kompak) */}
                  <View style={[styles.qtyRow, { borderTopColor: colors.border }]}>
                    <View style={styles.qtyCol}>
                      <Text style={[styles.qtyLabel, { color: colors.textMuted }]}>TARGET</Text>
                      <Text style={[styles.qtyValue, { color: colors.textPrimary }]}>
                        {target.toLocaleString('id-ID')} <Text style={styles.qtyUnit}>pcs</Text>
                      </Text>
                    </View>
                    <View style={styles.qtyColRight}>
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

          {/* Total Summary Footer Strip */}
          <View
            style={[
              styles.totalFooter,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <View>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>TOTAL OUTPUT ({items.length} MESIN)</Text>
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
    maxWidth: 400,
    maxHeight: '82%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: typography.sizes.micro,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contextStrip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
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
    flex: 1,
    marginRight: 8,
  },
  shiftPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  shiftPillText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  machineCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  machineCountText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '700',
  },
  contextText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  itemsScroll: {
    maxHeight: 240,
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
    fontSize: typography.sizes.micro - 2,
    fontWeight: '900',
  },
  machineName: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
  },
  processTag: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
    marginLeft: 4,
  },
  effPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  effPillText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
  itemPartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  partText: {
    fontSize: typography.sizes.micro,
    flex: 1,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  qtyCol: {
    flex: 1,
  },
  qtyColRight: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qtyValue: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    marginTop: 1,
  },
  qtyUnit: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '600',
  },
  totalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    marginTop: 1,
  },
  efficiencyBig: {
    fontSize: typography.sizes.body,
    fontWeight: '900',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.body - 1,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1.3,
    height: 44,
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body - 1,
    fontWeight: '800',
  },
});

export default ConfirmProductionModal;
