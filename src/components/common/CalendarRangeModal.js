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
  RotateCcw,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getLocalDateString } from '../../utils/dateFormatter';

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const WEEKDAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Format string YYYY-MM-DD ke teks singkat bahasa Indonesia (e.g. "23 Okt 2026")
 */
const formatPrettyDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d} ${shortMonths[m - 1]} ${y}`;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Hitung jumlah hari inklusif antara 2 tanggal YYYY-MM-DD
 */
const calculateDaysCount = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;
  try {
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffTime = date2.getTime() - date1.getTime();
    if (diffTime < 0) return 0;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch (e) {
    return 0;
  }
};

/**
 * CalendarRangeModal
 * Interactive Pop-up Modal untuk pemilihan rentang tanggal (Date to Date)
 * Didesain sangat praktis & compact (Zero-Scroll):
 * 1. Header bersih & ringkas dengan tombol close
 * 2. Range strip 1-baris responsif (Mulai -> Selesai dengan durasi badge)
 * 3. 4 Pintasan Cepat sebaris (Hari Ini, 7 Hari, 30 Hari, Bulan Ini) tanpa horizontal scroll
 * 4. Navigasi bulan elegan (< Bulan Tahun >) dengan perpindahan tahun otomatis
 * 5. Footer seimbang: tombol Reset square, tombol Batal, dan tombol Terapkan yang jelas
 */
export const CalendarRangeModal = ({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
}) => {
  const { colors, isDark } = useTheme();

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);

  // Internal draft date state
  const [selectedStart, setSelectedStart] = useState(initialStartDate || todayStr);
  const [selectedEnd, setSelectedEnd] = useState(initialEndDate || todayStr);

  // Navigasi Tampilan Kalender (Tahun & Bulan)
  const [viewYear, setViewYear] = useState(() => {
    if (initialEndDate) return Number(initialEndDate.split('-')[0]) || new Date().getFullYear();
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (initialEndDate) return (Number(initialEndDate.split('-')[1]) - 1) || new Date().getMonth();
    return new Date().getMonth();
  });

  // Mode pemilihan: 'start' | 'end' | 'done'
  const [pickStep, setPickStep] = useState('done');

  // Sinkronisasi saat modal dibuka
  useEffect(() => {
    if (visible) {
      const start = initialStartDate || todayStr;
      const end = initialEndDate || todayStr;
      setSelectedStart(start);
      setSelectedEnd(end);
      setPickStep('done');

      // Fokuskan kalender ke bulan dari end date atau start date
      const focusDate = end || start || todayStr;
      const parts = focusDate.split('-').map(Number);
      if (parts.length >= 2) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [visible, initialStartDate, initialEndDate, todayStr]);

  // Navigasi Bulan (Otomatis ganti tahun jika lewat Desember / Januari)
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

  // Handler klik tanggal pada kalender
  const handleSelectDay = (dateStr) => {
    if (!selectedStart || pickStep === 'done' || pickStep === 'start') {
      setSelectedStart(dateStr);
      setSelectedEnd('');
      setPickStep('end');
    } else if (pickStep === 'end') {
      if (dateStr >= selectedStart) {
        setSelectedEnd(dateStr);
        setPickStep('done');
      } else {
        setSelectedStart(dateStr);
        setSelectedEnd('');
        setPickStep('end');
      }
    }
  };

  // Quick Presets
  const applyPreset = (presetType) => {
    const now = new Date();
    const today = getLocalDateString(now);

    let sStr = today;
    let eStr = today;

    if (presetType === 'today') {
      sStr = today;
      eStr = today;
    } else if (presetType === '7days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      sStr = getLocalDateString(d);
      eStr = today;
    } else if (presetType === '30days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      sStr = getLocalDateString(d);
      eStr = today;
    } else if (presetType === 'thisMonth') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      sStr = getLocalDateString(d);
      eStr = today;
    }

    setSelectedStart(sStr);
    setSelectedEnd(eStr);
    setPickStep('done');

    const parts = eStr.split('-').map(Number);
    if (parts.length >= 2) {
      setViewYear(parts[0]);
      setViewMonth(parts[1] - 1);
    }
  };

  const handleReset = () => {
    setSelectedStart(todayStr);
    setSelectedEnd(todayStr);
    setPickStep('done');
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const handleApply = () => {
    const effectiveStart = selectedStart || todayStr;
    const effectiveEnd = selectedEnd || selectedStart || todayStr;

    if (effectiveStart > effectiveEnd) {
      onApply(effectiveEnd, effectiveStart);
    } else {
      onApply(effectiveStart, effectiveEnd);
    }
    onClose();
  };

  // Matrix Hari untuk viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ id: `pad-start-${i}`, isEmpty: true });
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${viewYear}-${mStr}-${dStr}`;

      const isStart = dateStr === selectedStart;
      const isEnd = dateStr === selectedEnd;
      const isInRange =
        selectedStart && selectedEnd && dateStr > selectedStart && dateStr < selectedEnd;
      const isToday = dateStr === todayStr;

      days.push({
        id: `day-${dateStr}`,
        dayNum,
        dateStr,
        isEmpty: false,
        isStart,
        isEnd,
        isInRange,
        isToday,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedStart, selectedEnd, todayStr]);

  const daysCount = useMemo(() => {
    if (selectedStart && selectedEnd) {
      return calculateDaysCount(selectedStart, selectedEnd);
    }
    if (selectedStart && !selectedEnd) {
      return 1;
    }
    return 0;
  }, [selectedStart, selectedEnd]);

  // Cek apakah preset sedang aktif
  const isPresetActive = (presetType) => {
    const now = new Date();
    const today = getLocalDateString(now);
    if (presetType === 'today') {
      return selectedStart === today && selectedEnd === today;
    }
    if (presetType === '7days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return selectedStart === getLocalDateString(d) && selectedEnd === today;
    }
    if (presetType === '30days') {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      return selectedStart === getLocalDateString(d) && selectedEnd === today;
    }
    if (presetType === 'thisMonth') {
      const first = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      return selectedStart === first && selectedEnd === today;
    }
    return false;
  };

  const PRESETS = [
    { id: 'today', label: 'Hari Ini' },
    { id: '7days', label: '7 Hari' },
    { id: '30days', label: '30 Hari' },
    { id: 'thisMonth', label: 'Bulan Ini' },
  ];

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
                <CalendarIcon size={16} color={colors.primary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Pilih Rentang Tanggal
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tutup modal"
            >
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Compact Date Range Strip */}
            <View
              style={[
                styles.compactRangeStrip,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Dari Tanggal */}
              <Pressable
                onPress={() => setPickStep('start')}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor: pickStep === 'start' ? (isDark ? colors.primary + '22' : colors.primary + '12') : colors.card,
                    borderColor: pickStep === 'start' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.rangeChipLabel, { color: colors.textMuted }]}>
                  MULAI
                </Text>
                <Text
                  style={[
                    styles.rangeChipValue,
                    {
                      color: selectedStart ? colors.textPrimary : colors.textMuted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {selectedStart ? formatPrettyDate(selectedStart) : 'Pilih'}
                </Text>
              </Pressable>

              {/* Separator Arrow & Days Count */}
              <View style={styles.rangeCenterWrap}>
                <ArrowRight size={14} color={colors.textSecondary} />
                {daysCount > 0 && (
                  <View style={[styles.rangeBadgePill, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.rangeBadgeText, { color: colors.primary }]}>
                      {daysCount} Hari
                    </Text>
                  </View>
                )}
              </View>

              {/* Sampai Tanggal */}
              <Pressable
                onPress={() => setPickStep('end')}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor: pickStep === 'end' ? (isDark ? colors.primary + '22' : colors.primary + '12') : colors.card,
                    borderColor: pickStep === 'end' ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.rangeChipLabel, { color: colors.textMuted }]}>
                  SELESAI
                </Text>
                <Text
                  style={[
                    styles.rangeChipValue,
                    {
                      color: selectedEnd ? colors.textPrimary : colors.textMuted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {selectedEnd ? formatPrettyDate(selectedEnd) : 'Pilih'}
                </Text>
              </Pressable>
            </View>

            {/* Quick Presets (Single Row 4 Pills) */}
            <View style={styles.presetsRow}>
              {PRESETS.map((item) => {
                const active = isPresetActive(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => applyPreset(item.id)}
                    style={({ pressed }) => [
                      styles.presetPill,
                      {
                        backgroundColor: active ? colors.primary : colors.cardSubtle,
                        borderColor: active ? colors.primary : colors.border,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetPillText,
                        {
                          color: active ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: active ? '700' : '600',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Calendar Controls (Clean Month Navigator) */}
            <View style={[styles.calendarNavRow, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={handlePrevMonth}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.navArrowBtn,
                  { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Bulan sebelumnya"
              >
                <ChevronLeft size={18} color={colors.textPrimary} />
              </Pressable>

              <View style={styles.monthTitleWrap}>
                <Text style={[styles.monthTitleText, { color: colors.textPrimary }]}>
                  {MONTH_NAMES_ID[viewMonth]} {viewYear}
                </Text>
              </View>

              <Pressable
                onPress={handleNextMonth}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.navArrowBtn,
                  { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Bulan berikutnya"
              >
                <ChevronRight size={18} color={colors.textPrimary} />
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

                const isSelectedEndpoint = item.isStart || item.isEnd;

                return (
                  <View key={item.id} style={styles.dayCol}>
                    {/* In-Range Connector Background */}
                    {item.isInRange && (
                      <View
                        style={[
                          styles.inRangeBand,
                          {
                            backgroundColor: isDark
                              ? 'rgba(37, 99, 235, 0.22)'
                              : 'rgba(37, 99, 235, 0.12)',
                          },
                        ]}
                      />
                    )}

                    {/* Half connectors for endpoints when range is spanning */}
                    {item.isStart && selectedEnd && selectedEnd !== selectedStart && (
                      <View
                        style={[
                          styles.halfRangeRight,
                          {
                            backgroundColor: isDark
                              ? 'rgba(37, 99, 235, 0.22)'
                              : 'rgba(37, 99, 235, 0.12)',
                          },
                        ]}
                      />
                    )}

                    {item.isEnd && selectedStart && selectedEnd !== selectedStart && (
                      <View
                        style={[
                          styles.halfRangeLeft,
                          {
                            backgroundColor: isDark
                              ? 'rgba(37, 99, 235, 0.22)'
                              : 'rgba(37, 99, 235, 0.12)',
                          },
                        ]}
                      />
                    )}

                    {/* Day Touch Target Button */}
                    <Pressable
                      onPress={() => handleSelectDay(item.dateStr)}
                      style={({ pressed }) => [
                        styles.dayCircle,
                        isSelectedEndpoint && [
                          styles.dayCircleSelected,
                          {
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                          },
                        ],
                        item.isToday &&
                          !isSelectedEndpoint && [
                            styles.dayCircleToday,
                            { borderColor: colors.primary },
                          ],
                        pressed && { opacity: 0.75 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Tanggal ${item.dayNum} ${MONTH_NAMES_ID[viewMonth]} ${viewYear}`}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          {
                            color: isSelectedEndpoint
                              ? '#FFFFFF'
                              : item.isInRange
                              ? colors.primary
                              : colors.textPrimary,
                            fontWeight:
                              isSelectedEndpoint || item.isToday ? '800' : '500',
                          },
                        ]}
                      >
                        {item.dayNum}
                      </Text>

                      {item.isToday && !isSelectedEndpoint && (
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

          {/* Modal Action Footer */}
          <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleReset}
              hitSlop={4}
              style={({ pressed }) => [
                styles.resetSquareBtn,
                { borderColor: colors.border, backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset ke hari ini"
            >
              <RotateCcw size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                { borderColor: colors.border, backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Batal"
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
              accessibilityRole="button"
              accessibilityLabel={`Terapkan rentang ${daysCount} hari`}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.applyBtnText}>
                {daysCount > 0 ? `Terapkan (${daysCount} Hari)` : 'Terapkan'}
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
    maxHeight: '94%',
    borderRadius: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  compactRangeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    marginBottom: 8,
  },
  rangeChip: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  rangeChipLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rangeChipValue: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  rangeCenterWrap: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  rangeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPillText: {
    fontSize: 11,
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  navArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleWrap: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  weekdayText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayColEmpty: {
    width: '14.28%',
    height: 38,
  },
  dayCol: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  inRangeBand: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    right: 0,
  },
  halfRangeRight: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: '50%',
    right: 0,
  },
  halfRangeLeft: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    right: '50%',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
    fontSize: 12.5,
  },
  todayDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  resetSquareBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
