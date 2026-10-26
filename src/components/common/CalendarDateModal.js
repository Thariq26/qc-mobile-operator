import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { getLocalDateString, formatIndonesianDate } from '../../utils/dateFormatter';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Hitung selisih hari dari hari ini ke targetDate (0 = Hari ini, 1 = Kemarin, dst.)
 */
const getDayDiffFromToday = (targetDateStr, todayStr) => {
  if (!targetDateStr || !todayStr) return 0;
  try {
    const [y1, m1, d1] = todayStr.split('-').map(Number);
    const [y2, m2, d2] = targetDateStr.split('-').map(Number);
    const dtToday = new Date(y1, m1 - 1, d1);
    const dtTarget = new Date(y2, m2 - 1, d2);
    const diffTime = dtToday.getTime() - dtTarget.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

/**
 * CalendarDateModal
 * Pop-up Modal interaktif untuk pemilihan tanggal tunggal (Single Date Picker)
 * Digunakan pada form pencatatan temuan cacat (InputDefectScreen)
 * Mendukung pintasan cepat (Hari Ini, Kemarin, 2 Hari Lalu, 3 Hari Lalu) dan kalender bulanan.
 */
export const CalendarDateModal = ({
  visible,
  onClose,
  onSelectDate,
  currentDate,
  maxDaysAgo = 3, // Standar audit mutu ISO 9001: maksimal 3 hari ke belakang
}) => {
  const { colors, isDark } = useTheme();

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  const [draftDate, setDraftDate] = useState(currentDate || todayStr);

  const [viewYear, setViewYear] = useState(() => {
    if (currentDate) return Number(currentDate.split('-')[0]) || new Date().getFullYear();
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (currentDate) return (Number(currentDate.split('-')[1]) - 1) || new Date().getMonth();
    return new Date().getMonth();
  });

  useEffect(() => {
    if (visible) {
      const active = currentDate || todayStr;
      setDraftDate(active);
      const parts = active.split('-').map(Number);
      if (parts.length >= 2) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [visible, currentDate, todayStr]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dateStr) => {
    setDraftDate(dateStr);
  };

  const applyPresetDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const dateStr = getLocalDateString(d);
    setDraftDate(dateStr);

    const parts = dateStr.split('-').map(Number);
    if (parts.length >= 2) {
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  };

  const handleApply = () => {
    onSelectDate(draftDate || todayStr);
    onClose();
  };

  const daysAgoDiff = useMemo(() => {
    return getDayDiffFromToday(draftDate, todayStr);
  }, [draftDate, todayStr]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ id: `pad-${i}`, isEmpty: true });
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${viewYear}-${mStr}-${dStr}`;

      const isSelected = dateStr === draftDate;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      // Cek apakah tanggal melewati batas audit
      const diff = getDayDiffFromToday(dateStr, todayStr);
      const isBeyondAudit = maxDaysAgo != null && diff > maxDaysAgo;

      days.push({
        id: `day-${dateStr}`,
        dayNum,
        dateStr,
        isEmpty: false,
        isSelected,
        isToday,
        isFuture,
        isBeyondAudit,
      });
    }

    return days;
  }, [viewYear, viewMonth, draftDate, todayStr, maxDaysAgo]);

  const getBadgeText = () => {
    if (daysAgoDiff === 0) return 'Hari Ini (Real-time)';
    if (daysAgoDiff === 1) return 'Kemarin (H-1)';
    if (daysAgoDiff === 2) return '2 Hari Lalu (H-2)';
    if (daysAgoDiff === 3) return '3 Hari Lalu (H-3)';
    if (daysAgoDiff > 3) return `${daysAgoDiff} Hari Lalu (Melebihi SOP)`;
    return 'Masa Depan';
  };

  const getBadgeColor = () => {
    if (daysAgoDiff === 0) return colors.success;
    if (daysAgoDiff === 1) return colors.warning;
    if (daysAgoDiff === 2 || daysAgoDiff === 3) return colors.primary;
    return colors.critical;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header Modal */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconBox, { backgroundColor: colors.primary + '20' }]}>
                <CalendarIcon size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  Pilih Tanggal Temuan Cacat
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Inspeksi kualitas (Maks. {maxDaysAgo} hari ke belakang)
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Active Selected Date Preview Box */}
            <View
              style={[
                styles.activeDateBox,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.activeDateRow}>
                <View style={styles.activeDateTextCol}>
                  <Text style={[styles.activeDateLabel, { color: colors.textMuted }]}>
                    TANGGAL TEMUAN TERPILIH:
                  </Text>
                  <Text style={[styles.activeDateTitle, { color: colors.textPrimary }]}>
                    {formatIndonesianDate(draftDate)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: getBadgeColor() + '20' },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: getBadgeColor() }]}>
                    {getBadgeText()}
                  </Text>
                </View>
              </View>

              {daysAgoDiff > maxDaysAgo && (
                <View style={styles.auditWarningRow}>
                  <AlertCircle size={13} color={colors.critical} style={{ marginRight: 5 }} />
                  <Text style={[styles.auditWarningText, { color: colors.critical }]}>
                    Peringatan: Backdate lebih dari {maxDaysAgo} hari memerlukan konfirmasi Supervisor QC.
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Presets Section */}
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsTitle, { color: colors.textSecondary }]}>
                PINTASAN CEPAT
              </Text>
              <View style={styles.presetsGrid}>
                {[
                  { label: 'Hari Ini', days: 0 },
                  { label: 'Kemarin', days: 1 },
                  { label: '2 Hari Lalu', days: 2 },
                  { label: '3 Hari Lalu', days: 3 },
                ].map((item) => {
                  const isActive = daysAgoDiff === item.days;
                  return (
                    <Pressable
                      key={`preset-${item.days}`}
                      onPress={() => applyPresetDaysAgo(item.days)}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isActive
                            ? colors.primary
                            : colors.cardSubtle,
                          borderColor: isActive
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          {
                            color: isActive ? '#FFFFFF' : colors.textPrimary,
                            fontWeight: isActive ? '800' : '600',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Calendar Controls (Month Navigator) */}
            <View style={[styles.calendarNavRow, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={handlePrevMonth}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.navArrowBtn,
                  { backgroundColor: colors.cardSubtle },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <ChevronLeft size={20} color={colors.textPrimary} />
              </Pressable>

              <Text style={[styles.monthTitleText, { color: colors.textPrimary }]}>
                {MONTH_NAMES_ID[viewMonth]} {viewYear}
              </Text>

              <Pressable
                onPress={handleNextMonth}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.navArrowBtn,
                  { backgroundColor: colors.cardSubtle },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <ChevronRight size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Weekday Names Header */}
            <View style={styles.weekdayRow}>
              {WEEKDAY_NAMES_ID.map((name, idx) => (
                <View key={`weekday-${idx}`} style={styles.weekdayCol}>
                  <Text
                    style={[
                      styles.weekdayText,
                      {
                        color:
                          idx === 0 || idx === 6
                            ? colors.critical
                            : colors.textMuted,
                      },
                    ]}
                  >
                    {name}
                  </Text>
                </View>
              ))}
            </View>

            {/* Days Grid (7 Columns) */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item) => {
                if (item.isEmpty) {
                  return <View key={item.id} style={styles.dayColEmpty} />;
                }

                return (
                  <View key={item.id} style={styles.dayCol}>
                    <Pressable
                      onPress={() => {
                        if (item.isFuture) return;
                        handleSelectDay(item.dateStr);
                      }}
                      disabled={item.isFuture}
                      style={({ pressed }) => [
                        styles.dayCircle,
                        item.isSelected && [
                          styles.dayCircleSelected,
                          {
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                          },
                        ],
                        item.isToday &&
                          !item.isSelected && [
                            styles.dayCircleToday,
                            { borderColor: colors.primary },
                          ],
                        item.isFuture && { opacity: 0.25 },
                        pressed && !item.isFuture && { opacity: 0.75 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Tanggal ${item.dayNum}`}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          {
                            color: item.isSelected
                              ? '#FFFFFF'
                              : item.isBeyondAudit
                              ? colors.warning
                              : colors.textPrimary,
                            fontWeight:
                              item.isSelected || item.isToday ? '800' : '500',
                          },
                        ]}
                      >
                        {item.dayNum}
                      </Text>

                      {item.isToday && !item.isSelected && (
                        <View
                          style={[
                            styles.todayDot,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                Batal
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [
                styles.applyBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.applyBtnText}>
                Pilih Tanggal Ini
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 8,
  },
  activeDateBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  activeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeDateTextCol: {
    flex: 1,
    marginRight: 8,
  },
  activeDateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  activeDateTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  auditWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  auditWarningText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  presetsSection: {
    marginBottom: 14,
  },
  presetsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 14,
    fontWeight: '800',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayColEmpty: {
    width: '14.28%',
    height: 42,
  },
  dayCol: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dayCircleToday: {
    borderWidth: 1.5,
  },
  dayNumberText: {
    fontSize: 13,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
