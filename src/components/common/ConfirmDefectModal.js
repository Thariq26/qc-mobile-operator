import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  AlertTriangle,
  Calendar,
  User,
  Package,
  Layers,
  Cpu,
  Camera,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { formatIndonesianDate } from '../../utils/dateFormatter';

/**
 * ConfirmDefectModal: Modal Konfirmasi Sebelum Catat Temuan Cacat (NG)
 * Menyajikan rincian lengkap part, jenis cacat, mesin, jumlah NG, dan operator lini untuk audit ISO 9001.
 */
export const ConfirmDefectModal = ({
  visible,
  onClose,
  onConfirm,
  submitting = false,
  data = {},
}) => {
  const { colors, isDark } = useTheme();

  const {
    defectDate = '',
    selectedShift = 'Shift 1',
    selectedOperator = null,
    operatorName = '',
    selectedPart = null,
    selectedDefect = null,
    selectedProcess = '',
    selectedMachine = '',
    quantity = 1,
    remarks = '',
    hasPhoto = false,
  } = data;

  const isCritical =
    selectedDefect?.category?.toLowerCase() === 'critical' ||
    selectedDefect?.name === 'Gompal' ||
    selectedDefect?.name === 'Keropos' ||
    selectedDefect?.name === 'Retak Tarik';

  const categoryColor = isCritical
    ? colors.critical
    : selectedDefect?.category?.toLowerCase() === 'major'
    ? colors.warning
    : colors.primary;

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
                  backgroundColor: colors.critical + '18',
                  borderColor: colors.critical + '40',
                },
              ]}
            >
              <AlertTriangle size={22} color={colors.critical} />
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
            Konfirmasi Lapor Cacat (NG)
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Pastikan data temuan cacat di bawah sudah akurat untuk kebutuhan audit mampu telusur ISO 9001.
          </Text>

          {/* Summary Box */}
          <View
            style={[
              styles.summaryContainer,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            {/* 1. Tanggal & Shift */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Calendar size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Waktu & Shift</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {defectDate ? formatIndonesianDate(defectDate) : 'Hari Ini'} • <Text style={{ color: colors.primary, fontWeight: '800' }}>{selectedShift}</Text>
              </Text>
            </View>

            {/* 2. Operator Lini Produksi */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <User size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Operator Lini</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {selectedOperator?.fullName || operatorName || '-'}
                {selectedOperator?.username ? ` (@${selectedOperator.username})` : ''}
              </Text>
            </View>

            {/* 3. Part Number */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Package size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Part Number</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]} numberOfLines={1}>
                <Text style={{ fontWeight: '800', color: colors.primary }}>{selectedPart?.partNumber}</Text> - {selectedPart?.partName}
              </Text>
            </View>

            {/* 4. Mesin & Proses */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Cpu size={13} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Mesin & Proses</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {selectedMachine} • {selectedProcess}
              </Text>
            </View>

            {/* 5. Jenis Cacat & Severity Category */}
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <AlertTriangle size={13} color={categoryColor} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Jenis Cacat</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.defectNameHighlight, { color: colors.textPrimary }]}>
                  {selectedDefect?.name}
                </Text>
                {selectedDefect?.category ? (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: categoryColor + '18', borderColor: categoryColor + '50' },
                    ]}
                  >
                    <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                      {selectedDefect.category}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* 6. Jumlah Cacat Highlight */}
            <View style={[styles.detailRow, styles.qtyHighlightRow, { borderTopColor: colors.border }]}>
              <View style={styles.detailLabelGroup}>
                <Text style={[styles.qtyHighlightLabel, { color: colors.textPrimary }]}>
                  JUMLAH TEMUAN CACAT
                </Text>
              </View>
              <View style={[styles.qtyBadge, { backgroundColor: colors.critical + '18', borderColor: colors.critical + '40' }]}>
                <Text style={[styles.qtyNumber, { color: colors.critical }]}>
                  {quantity} <Text style={{ fontSize: 13, fontWeight: '700' }}>pcs</Text>
                </Text>
              </View>
            </View>

            {/* 7. Foto & Keterangan */}
            <View style={[styles.detailRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={styles.detailLabelGroup}>
                <Camera size={13} color={hasPhoto ? colors.success : colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Lampiran Foto</Text>
              </View>
              <Text
                style={[
                  styles.detailValue,
                  { color: hasPhoto ? colors.success : colors.textMuted, fontWeight: '700' },
                ]}
              >
                {hasPhoto ? '✓ Foto Terlampir' : 'Tanpa Foto'}
              </Text>
            </View>

            {remarks && remarks.trim() ? (
              <View style={[styles.remarksBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <FileText size={12} color={colors.textMuted} style={{ marginRight: 5, marginTop: 2 }} />
                <Text style={[styles.remarksText, { color: colors.textSecondary }]} numberOfLines={2}>
                  "{remarks.trim()}"
                </Text>
              </View>
            ) : null}
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
                { backgroundColor: colors.critical },
                pressed && { opacity: 0.85 },
                submitting && { opacity: 0.6 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.confirmButtonText}>Ya, Lapor Cacat</Text>
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
  summaryContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: typography.sizes.caption - 1,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  defectNameHighlight: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  qtyHighlightRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  qtyHighlightLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  qtyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  remarksBox: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  remarksText: {
    fontSize: typography.sizes.caption - 1,
    fontStyle: 'italic',
    flex: 1,
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
    shadowColor: '#DC2626',
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

export default ConfirmDefectModal;
