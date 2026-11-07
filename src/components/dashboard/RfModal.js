import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  Share,
} from 'react-native';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  Copy,
  Check,
  Wrench,
  Share2,
  ListChecks,
  Activity,
  ShieldAlert,
  Sliders,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * RfModal: Modern, Practical & Dynamic Bottom Sheet for Random Forest AI Prescriptions
 * Features:
 * - Dynamic Confidence Progress Gauge
 * - Actionable Shop Floor Hero Card with One-Tap Copy / Share
 * - Interactive Dual Tab: "Diagnosis & Akar Masalah" vs "Checklist Eksekusi SOP"
 * - Dynamic Action Checklist tailored to the defect and process
 * - Haptic/Visual Feedback on action application
 */
export const RfModal = ({
  visible,
  onClose,
  defectName = 'Gompal',
  process = 'Blanking',
  predictionData,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Active Tab: 'diagnosis' | 'checklist'
  const [activeTab, setActiveTab] = useState('diagnosis');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (visible) {
      setActiveTab('diagnosis');
      setCopied(false);
      setApplied(false);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 240,
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
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  if (!visible) return null;

  const confidenceStr = predictionData?.confidence || '96.2%';
  const confidenceNum = parseFloat(confidenceStr.replace('%', '')) || 95;
  const rekomendasi =
    predictionData?.rekomendasi ||
    'Setting ulang alignment punch dan die serta pastikan clearance pisau potong seragam.';
  const rootCause =
    predictionData?.rootCause ||
    'Mata pisau punch tumpul dan radius mata potong sudah melebihi 0.15mm.';
  const sopStep = predictionData?.sopStep || 'SOP-STAMP-011 Rev 2';

  // Format checklist steps dynamically
  const executionChecklist = [
    {
      step: 1,
      title: 'Safety & Isolasi Mesin',
      desc: `Matikan mesin dan pastikan safety block / pin terpasang kokoh pada stasiun ${process}.`,
    },
    {
      step: 2,
      title: 'Tindakan Presisi Tooling',
      desc: `${rekomendasi}`,
    },
    {
      step: 3,
      title: 'Inspeksi First-Piece Trial',
      desc: `Jalankan 1-3 stroke percobaan dan ukur kesesuaian part sesuai acuan ${sopStep}.`,
    },
  ];

  // Copy or Share Action
  const handleCopyOrShare = async () => {
    const textToShare = `[SOLUSI AI QC - PT GMP]\nTarget: ${defectName} (${process})\nTindakan: ${rekomendasi}\nAkar Masalah: ${rootCause}\nAcuan: ${sopStep}\nAkurasi Model: ${confidenceStr}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare);
      } else {
        await Share.share({
          message: textToShare,
          title: `Solusi Cacat ${defectName} (${process})`,
        });
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyAction = () => {
    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

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
                backgroundColor: colors.backdrop || 'rgba(0,0,0,0.65)',
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Dynamic Bottom Sheet Container */}
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
          {/* Top Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header Row with Modern Badges */}
          <View style={styles.headerRow}>
            <View style={styles.titleInfo}>
              <View style={styles.titleRow}>
                <View
                  style={[
                    styles.aiIconBadge,
                    {
                      backgroundColor: '#3B82F61C',
                      borderColor: '#3B82F644',
                    },
                  ]}
                >
                  <Zap size={18} color="#3B82F6" />
                </View>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                    Solusi Random Forest AI
                  </Text>
                  <View style={styles.chipsRow}>
                    <View style={[styles.targetChip, { backgroundColor: colors.primary + '16', borderColor: colors.primary + '33' }]}>
                      <Text style={[styles.targetChipText, { color: colors.primary }]}>
                        {defectName} • {process}
                      </Text>
                    </View>
                    <View style={[styles.priorityChip, { backgroundColor: '#EF444416', borderColor: '#EF444433' }]}>
                      <Text style={styles.priorityChipText}>
                        Prioritas Tinggi
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={14}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Dynamic Accuracy Meter Bar */}
          <View style={[styles.accuracyContainer, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <View style={styles.accuracyHeader}>
              <View style={styles.accuracyLeft}>
                <CheckCircle2 size={14} color={colors.success} style={{ marginRight: 6 }} />
                <Text style={[styles.accuracyTitle, { color: colors.textSecondary }]}>
                  Akurasi Prediksi Model (ML v2.0)
                </Text>
              </View>
              <Text style={[styles.accuracyPercent, { color: colors.success }]}>
                {confidenceStr}
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.max(10, confidenceNum))}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>
          </View>

          {/* Practical Shop Floor Hero Card */}
          <View
            style={[
              styles.heroActionCard,
              {
                backgroundColor: isDark ? '#0F1E36' : '#EFF6FF',
                borderColor: '#3B82F644',
              },
            ]}
          >
            <View style={styles.heroCardHeader}>
              <View style={styles.heroBadgeRow}>
                <Wrench size={13} color="#2563EB" style={{ marginRight: 5 }} />
                <Text style={styles.heroBadgeText}>
                  TINDAKAN PERBAIKAN MESIN (SHOP FLOOR)
                </Text>
              </View>
              <Pressable
                onPress={handleCopyOrShare}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.quickCopyBtn,
                  { backgroundColor: copied ? '#10B98122' : '#3B82F61A' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {copied ? (
                  <>
                    <Check size={12} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={[styles.quickCopyText, { color: '#10B981' }]}>Tersalin</Text>
                  </>
                ) : (
                  <>
                    <Copy size={12} color="#2563EB" style={{ marginRight: 4 }} />
                    <Text style={[styles.quickCopyText, { color: '#2563EB' }]}>Salin</Text>
                  </>
                )}
              </Pressable>
            </View>

            <Text style={[styles.heroActionTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              "{rekomendasi}"
            </Text>
          </View>

          {/* Dynamic Segmented Switcher (Tab) */}
          <View style={[styles.tabBarContainer, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setActiveTab('diagnosis')}
              style={[
                styles.tabItem,
                activeTab === 'diagnosis' && [styles.tabItemActive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Activity
                size={14}
                color={activeTab === 'diagnosis' ? colors.primary : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'diagnosis' ? colors.textPrimary : colors.textSecondary },
                  activeTab === 'diagnosis' && styles.tabTextActive,
                ]}
              >
                Diagnosis & SOP
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('checklist')}
              style={[
                styles.tabItem,
                activeTab === 'checklist' && [styles.tabItemActive, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <ListChecks
                size={14}
                color={activeTab === 'checklist' ? colors.primary : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'checklist' ? colors.textPrimary : colors.textSecondary },
                  activeTab === 'checklist' && styles.tabTextActive,
                ]}
              >
                Langkah Eksekusi (3)
              </Text>
            </Pressable>
          </View>

          {/* Dynamic Content Views */}
          {activeTab === 'diagnosis' ? (
            <View style={styles.tabContentBlock}>
              {/* Root Cause Diagnosis */}
              <View style={[styles.infoTile, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                <View style={styles.tileHeader}>
                  <AlertTriangle size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                  <Text style={[styles.tileTitle, { color: '#F59E0B' }]}>
                    Analisis Akar Masalah (Root Cause)
                  </Text>
                </View>
                <Text style={[styles.tileBodyText, { color: colors.textPrimary }]}>
                  {rootCause}
                </Text>
              </View>

              {/* Standard Document Reference */}
              <View style={[styles.infoTile, { backgroundColor: colors.cardSubtle, borderColor: colors.border, marginTop: 8 }]}>
                <View style={styles.tileHeader}>
                  <FileText size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.tileTitle, { color: colors.primary }]}>
                    Acuan Dokumen Standar
                  </Text>
                </View>
                <Text style={[styles.tileBodyText, { color: colors.textPrimary }]}>
                  {sopStep}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.tabContentBlock}>
              {executionChecklist.map((item) => (
                <View
                  key={item.step}
                  style={[
                    styles.checkStepRow,
                    { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.stepNumCircle, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                    <Text style={[styles.stepNumText, { color: colors.primary }]}>
                      {item.step}
                    </Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Modern Dual-Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              onPress={handleCopyOrShare}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Share2 size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
                Bagikan
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApplyAction}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: applied ? colors.success : colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              {applied ? (
                <>
                  <Check size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Telah Diterapkan</Text>
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Mengerti & Terapkan</Text>
                </>
              )}
            </Pressable>
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
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    paddingTop: 10,
    maxHeight: '92%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 6,
  },
  handleBar: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sheetTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  targetChip: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  targetChipText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  priorityChip: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityChipText: {
    color: '#EF4444',
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyContainer: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  accuracyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  accuracyPercent: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroActionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  quickCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quickCopyText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  heroActionTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  tabBarContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
  },
  tabItemActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '800',
  },
  tabContentBlock: {
    marginBottom: 14,
  },
  infoTile: {
    padding: 11,
    borderRadius: 11,
    borderWidth: 1,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tileTitle: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  tileBodyText: {
    fontSize: typography.sizes.caption,
    fontWeight: '600',
    lineHeight: 18,
  },
  checkStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 7,
  },
  stepNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: typography.sizes.micro,
    lineHeight: 15,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
});

export default RfModal;
