import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Zap, Bot, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { SpringButton } from '../common/SpringButton';
import { typography } from '../../theme/typography';

/**
 * RfModal: Bottom Sheet Dialog for Random Forest AI Action Recommendation
 * Displays ML model confidence (94.8%), root cause, SOP reference, and Tanya AI shortcut.
 */
export const RfModal = ({
  visible,
  onClose,
  defectName = 'Gompal',
  process = 'Blanking',
  predictionData,
  onConsultAi,
}) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  if (!visible) return null;

  const confidence = predictionData?.confidence || '94.8%';
  const rekomendasi = predictionData?.rekomendasi || 'Grinding die untuk memperbesar gap clearance punch & pastikan tidak over.';
  const rootCause = predictionData?.rootCause || 'Clearance punch & die terlalu rapat, menyebabkan material sompal pada titik potong.';
  const sopStep = predictionData?.sopStep || 'SOP-STAMP-004 Rev 3';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                backgroundColor: colors.backdrop,
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Card */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header with Lightning Badge */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithBadge}>
              <View style={[styles.lightningIcon, { backgroundColor: '#6366F122', borderColor: '#6366F155' }]}>
                <Zap size={20} color="#818CF8" />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  Solusi Random Forest AI
                </Text>
                <Text style={[styles.targetDefect, { color: colors.textSecondary }]}>
                  Target: {defectName} ({process})
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Model Confidence Tag */}
          <View style={[styles.confidenceBanner, { backgroundColor: colors.success + '1A', borderColor: colors.success + '40' }]}>
            <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={[styles.confidenceText, { color: colors.success }]}>
              Akurasi Prediksi Model: {confidence} • Machine Learning v2.0
            </Text>
          </View>

          {/* Main Action Box */}
          <View style={[styles.sectionBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <View style={styles.boxTitleRow}>
              <Zap size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.boxTitle, { color: colors.primary }]}>
                TINDAKAN PERBAIKAN MESIN (SHOP FLOOR)
              </Text>
            </View>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              "{rekomendasi}"
            </Text>
          </View>

          {/* Root Cause & SOP Meta */}
          <View style={[styles.metaBox, { borderColor: colors.border }]}>
            <View style={styles.metaRow}>
              <AlertTriangle size={15} color={colors.warning} style={{ marginRight: 6, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                  Analisis Akar Masalah:
                </Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {rootCause}
                </Text>
              </View>
            </View>

            <View style={[styles.metaRow, { marginTop: 10 }]}>
              <Bot size={15} color={colors.aiAccentLight || colors.primary} style={{ marginRight: 6, marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                  Acuan Dokumen Standar:
                </Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {sopStep} (Toleransi Die Stamping)
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.buttonStack}>
            <SpringButton
              title="Konsultasikan Detail ke Tanya AI"
              variant="gradient"
              gradientColors={['#2563EB', '#6366F1', '#7C3AED']}
              icon={<Bot size={18} color="#FFFFFF" />}
              iconRight={<ArrowRight size={16} color="#FFFFFF" />}
              onPress={() => {
                onClose();
                if (onConsultAi) onConsultAi(defectName, process);
              }}
              style={{ width: '100%' }}
            />

            <SpringButton
              title="Tutup Panel Rekomendasi"
              variant="outline"
              size="small"
              onPress={onClose}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 26,
    paddingTop: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lightningIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sheetTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
  },
  targetDefect: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  confidenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  confidenceText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  sectionBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  boxTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionText: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '700',
    lineHeight: 20,
  },
  metaBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 18,
  },
  buttonStack: {
    marginTop: 4,
  },
});

export default RfModal;
