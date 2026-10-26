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
  CheckCircle2,
  Calendar,
  User,
  Package,
  Cpu,
  Camera,
  FileText,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatIndonesianDate } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';

/**
 * ConfirmDefectModal: Shop Floor Confirmation Dialog for Defect (NG) Logging
 * Desain Praktis, Kompak, & Ergonomis (Anti-Truncation)
 */
export const ConfirmDefectModal = ({
  visible,
  onClose,
  onConfirm,
  submitting = false,
  data,
  defectDate: propDate = '',
  selectedShift: propShift = 'Shift 1',
  selectedOperator: propOp = null,
  operatorName: propOpName = '',
  selectedPart: propPart = null,
  selectedMachine: propMachine = '',
  selectedProcess: propProcess = '',
  selectedDefect: propDefect = null,
  quantity: propQty = 1,
  remarks: propRemarks = '',
  hasPhoto: propHasPhoto = false,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  // Resolusi data: Mendukung passing via data={{ ... }} (dari InputDefectScreen) ATAU props langsung
  const defectDate = data?.defectDate ?? propDate ?? '';
  const selectedShift = data?.selectedShift ?? propShift ?? 'Shift 1';
  const selectedOperator = data?.selectedOperator ?? propOp ?? null;
  const operatorName = data?.operatorName ?? propOpName ?? '';
  const selectedPart = data?.selectedPart ?? propPart ?? null;
  const selectedMachine = data?.selectedMachine ?? propMachine ?? '';
  const selectedProcess = data?.selectedProcess ?? propProcess ?? '';
  const selectedDefect = data?.selectedDefect ?? propDefect ?? null;
  const quantity = Number(data?.quantity ?? propQty ?? 1);
  const remarks = data?.remarks ?? propRemarks ?? '';
  const hasPhoto = Boolean(data?.hasPhoto ?? propHasPhoto);

  const isCritical =
    selectedDefect?.category === 'Critical' ||
    selectedDefect?.name === 'Gompal' ||
    selectedDefect?.name === 'Keropos' ||
    selectedDefect?.name === 'Retak Tarik' ||
    selectedDefect?.name === 'Double Punch';

  const categoryColor = isCritical ? colors.critical : colors.warning;
  const displayOperator = selectedOperator?.fullName || operatorName || 'Operator';

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
                    backgroundColor: colors.critical + '18',
                    borderColor: colors.critical + '40',
                  },
                ]}
              >
                <AlertTriangle size={18} color={colors.critical} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Konfirmasi Lapor Cacat
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Periksa detail temuan sebelum disimpan
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

          {/* 1. Context Strip: Mesin, Proses, Shift, & Tanggal */}
          <View
            style={[
              styles.contextStrip,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <View style={styles.contextLeft}>
              <Cpu size={13} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.contextMachine, { color: colors.textPrimary }]} numberOfLines={1}>
                {selectedMachine || 'Amada 1'} • {selectedProcess || 'Stamping'}
              </Text>
            </View>

            <View style={[styles.shiftBadge, { backgroundColor: colors.primary + '18' }]}>
              <Text style={[styles.shiftBadgeText, { color: colors.primary }]}>
                {selectedShift}
              </Text>
            </View>
          </View>

          {/* 2. Part Info Block (Bebas Truncation) */}
          <View
            style={[
              styles.partBlock,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border },
            ]}
          >
            <View style={styles.partTopRow}>
              <View style={[styles.partNumBadge, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
                <Text style={[styles.partNumText, { color: colors.primary }]}>
                  {selectedPart?.partNumber || 'PT-1001'}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {defectDate ? formatIndonesianDate(defectDate) : 'Hari Ini'}
              </Text>
            </View>
            <Text style={[styles.partNameFull, { color: colors.textPrimary }]} numberOfLines={2}>
              {selectedPart?.partName || 'Part Komponen'}
            </Text>
          </View>

          {/* 3. Highlight Temuan Cacat & Kuantitas NG (Hero Box) */}
          <View
            style={[
              styles.defectHeroCard,
              {
                backgroundColor: colors.critical + '0C',
                borderColor: colors.critical + '35',
              },
            ]}
          >
            <View style={styles.defectHeroLeft}>
              <Text style={[styles.defectHeroLabel, { color: colors.textMuted }]}>
                JENIS CACAT TEMUAN
              </Text>
              <View style={styles.defectNameRow}>
                <Text style={[styles.defectNameText, { color: colors.textPrimary }]}>
                  {selectedDefect?.name || 'Cacat'}
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

            <View
              style={[
                styles.ngBadge,
                { backgroundColor: colors.critical + '18', borderColor: colors.critical + '45' },
              ]}
            >
              <Text style={[styles.ngNumber, { color: colors.critical }]}>
                {quantity}
              </Text>
              <Text style={[styles.ngUnit, { color: colors.critical }]}>
                pcs NG
              </Text>
            </View>
          </View>

          {/* 4. Operator & Lampiran Foto (Satu Baris Kompak) */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <User size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                Operator:{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  {displayOperator}
                </Text>
              </Text>
            </View>

            <View style={styles.metaColRight}>
              <Camera size={13} color={hasPhoto ? colors.success : colors.textMuted} style={{ marginRight: 5 }} />
              <Text
                style={[
                  styles.metaText,
                  { color: hasPhoto ? colors.success : colors.textMuted, fontWeight: '700' },
                ]}
              >
                {hasPhoto ? 'Ada Foto' : 'Tanpa Foto'}
              </Text>
            </View>
          </View>

          {/* Remarks jika ada */}
          {remarks && remarks.trim() ? (
            <View style={[styles.remarksBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <FileText size={12} color={colors.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
              <Text style={[styles.remarksText, { color: colors.textSecondary }]} numberOfLines={1}>
                "{remarks.trim()}"
              </Text>
            </View>
          ) : null}

          {/* 5. Action Buttons */}
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
    maxWidth: 400,
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
    marginBottom: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  contextLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contextMachine: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  shiftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  shiftBadgeText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
  partBlock: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  partTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partNumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  partNumText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '500',
  },
  partNameFull: {
    fontSize: typography.sizes.caption + 1,
    fontWeight: '700',
    lineHeight: 18,
  },
  defectHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  defectHeroLeft: {
    flex: 1,
    marginRight: 10,
  },
  defectHeroLabel: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  defectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defectNameText: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 6,
  },
  categoryBadgeText: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
  },
  ngBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    minWidth: 68,
  },
  ngNumber: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  ngUnit: {
    fontSize: typography.sizes.micro - 2,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  metaColRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.sizes.micro,
  },
  remarksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  remarksText: {
    fontSize: typography.sizes.micro,
    fontStyle: 'italic',
    flex: 1,
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

export default ConfirmDefectModal;
