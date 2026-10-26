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
  Clock,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
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
 * Ramah operator pabrik (presbyopia & sarung tangan), mendukung dark/light mode,
 * tombol pintasan cepat (Quick Presets), navigasi bulan & tahun.
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

  // Navigasi Bulan
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

  // Navigasi Tahun
  const handlePrevYear = () => setViewYear((prev) => prev - 1);
  const handleNextYear = () => setViewYear((prev) => prev + 1);

  // Handler klik tanggal pada kalender
  const handleSelectDay = (dateStr) => {
    if (!selectedStart || pickStep === 'done' || pickStep === 'start') {
      // Memulai pemilihan tanggal awal
      setSelectedStart(dateStr);
      setSelectedEnd('');
      setPickStep('end');
    } else if (pickStep === 'end') {
      if (dateStr >= selectedStart) {
        // Tanggal akhir valid
        setSelectedEnd(dateStr);
        setPickStep('done');
      } else {
        // Jika tanggal yang diklik lebih awal dari start, ubah start menjadi tanggal ini
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
    } else if (presetType === 'yesterday') {
      const d = new Date(now);
      d.setDate(now.getDate() - 1);
      sStr = getLocalDateString(d);
      eStr = sStr;
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
    } else if (presetType === 'lastMonth') {
      const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      sStr = getLocalDateString(firstLastMonth);
      eStr = getLocalDateString(lastLastMonth);
    } else if (presetType === 'all2026') {
      // Rentang data sampel pabrik dari April sampai Oktober 2026
      sStr = '2026-04-01';
      eStr = today;
    }

    setSelectedStart(sStr);
    setSelectedEnd(eStr);
    setPickStep('done');

    // Geser tampilan kalender ke bulan tanggal akhir
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

    // Pastikan start <= end
    if (effectiveStart > effectiveEnd) {
      onApply(effectiveEnd, effectiveStart);
    } else {
      onApply(effectiveStart, effectiveEnd);
    }
    onClose();
  };

  // Generate Matrix Hari untuk viewMonth & viewYear
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Min, 1 = Sen, dst.

    const days = [];

    // Hari kosong di awal bulan (padding)
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ id: `pad-start-${i}`, isEmpty: true });
    }

    // Hari-hari dalam bulan berjalan
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
    return calculateDaysCount(selectedStart, selectedEnd);
  }, [selectedStart, selectedEnd]);

  // Cek apakah preset sedang aktif
  const isPresetActive = (presetType) => {
    const now = new Date();
    const today = getLocalDateString(now);
    if (presetType === 'today') {
      return selectedStart === today && selectedEnd === today;
    }
    if (presetType === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      const yestStr = getLocalDateString(yest);
      return selectedStart === yestStr && selectedEnd === yestStr;
    }
    if (presetType === 'thisMonth') {
      const first = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      return selectedStart === first && selectedEnd === today;
    }
    if (presetType === 'all2026') {
      return selectedStart === '2026-04-01' && selectedEnd === today;
    }
    return false;
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
                  Pilih Rentang Tanggal
                </Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Analisis data inspeksi & mutu (Date to Date)
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
            {/* Range Preview Card */}
            <View
              style={[
                styles.rangePreviewCard,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.dateBoxesRow}>
                {/* Dari Tanggal */}
                <Pressable
                  onPress={() => setPickStep('start')}
                  style={[
                    styles.dateBox,
                    {
                      backgroundColor: colors.background,
                      borderColor:
                        pickStep === 'start' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.dateBoxLabel, { color: colors.textMuted }]}>
                    DARI TANGGAL
                  </Text>
                  <Text
                    style={[
                      styles.dateBoxValue,
                      {
                        color: selectedStart ? colors.textPrimary : colors.textMuted,
                      },
                    ]}
                  >
                    {selectedStart ? formatPrettyDate(selectedStart) : 'Pilih Mulai'}
                  </Text>
                </Pressable>

                <View style={styles.dateArrowWrap}>
                  <ArrowRight size={16} color={colors.textSecondary} />
                </View>

                {/* Sampai Tanggal */}
                <Pressable
                  onPress={() => setPickStep('end')}
                  style={[
                    styles.dateBox,
                    {
                      backgroundColor: colors.background,
                      borderColor:
                        pickStep === 'end' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.dateBoxLabel, { color: colors.textMuted }]}>
                    SAMPAI TANGGAL
                  </Text>
                  <Text
                    style={[
                      styles.dateBoxValue,
                      {
                        color: selectedEnd ? colors.textPrimary : colors.textMuted,
                      },
                    ]}
                  >
                    {selectedEnd ? formatPrettyDate(selectedEnd) : 'Pilih Akhir'}
                  </Text>
                </Pressable>
              </View>

              {/* Status Durasi & Petunjuk */}
              <View style={styles.durationRow}>
                {selectedStart && selectedEnd ? (
                  <View style={[styles.durationBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Clock size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.durationBadgeText, { color: colors.primary }]}>
                      Total Durasi: {daysCount} Hari Analisis
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.hintText, { color: colors.warning }]}>
                    {pickStep === 'start'
                      ? '👉 Ketuk tanggal awal pada kalender'
                      : '👉 Ketuk tanggal akhir pada kalender'}
                  </Text>
                )}
              </View>
            </View>

            {/* Quick Presets Chips */}
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsTitle, { color: colors.textSecondary }]}>
                PINTASAN CEPAT
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsScroll}
              >
                <Pressable
                  onPress={() => applyPreset('today')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isPresetActive('today')
                        ? colors.primary
                        : colors.cardSubtle,
                      borderColor: isPresetActive('today')
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isPresetActive('today') ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isPresetActive('today') ? '800' : '600',
                      },
                    ]}
                  >
                    Hari Ini
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset('yesterday')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isPresetActive('yesterday')
                        ? colors.primary
                        : colors.cardSubtle,
                      borderColor: isPresetActive('yesterday')
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isPresetActive('yesterday') ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isPresetActive('yesterday') ? '800' : '600',
                      },
                    ]}
                  >
                    Kemarin
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset('7days')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.cardSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.presetChipText, { color: colors.textPrimary }]}>
                    7 Hari Terakhir
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset('thisMonth')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isPresetActive('thisMonth')
                        ? colors.primary
                        : colors.cardSubtle,
                      borderColor: isPresetActive('thisMonth')
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isPresetActive('thisMonth') ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isPresetActive('thisMonth') ? '800' : '600',
                      },
                    ]}
                  >
                    Bulan Ini (Okt)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset('lastMonth')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.cardSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.presetChipText, { color: colors.textPrimary }]}>
                    Bulan Lalu (Sep)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => applyPreset('all2026')}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isPresetActive('all2026')
                        ? colors.primary
                        : colors.cardSubtle,
                      borderColor: isPresetActive('all2026')
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      {
                        color: isPresetActive('all2026') ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isPresetActive('all2026') ? '800' : '600',
                      },
                    ]}
                  >
                    Semua Data (Apr-Okt 2026)
                  </Text>
                </Pressable>
              </ScrollView>
            </View>

            {/* Calendar Controls (Month & Year Navigator) */}
            <View style={[styles.calendarNavRow, { borderBottomColor: colors.border }]}>
              <View style={styles.yearControl}>
                <Pressable
                  onPress={handlePrevYear}
                  hitSlop={8}
                  style={styles.yearNavBtn}
                >
                  <Text style={[styles.yearNavText, { color: colors.textMuted }]}>
                    « {viewYear - 1}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.monthNavigator}>
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

                <View style={styles.monthTitleWrap}>
                  <Text style={[styles.monthTitleText, { color: colors.textPrimary }]}>
                    {MONTH_NAMES_ID[viewMonth]} {viewYear}
                  </Text>
                </View>

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

              <View style={styles.yearControl}>
                <Pressable
                  onPress={handleNextYear}
                  hitSlop={8}
                  style={styles.yearNavBtn}
                >
                  <Text style={[styles.yearNavText, { color: colors.textMuted }]}>
                    {viewYear + 1} »
                  </Text>
                </Pressable>
              </View>
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
              style={({ pressed }) => [
                styles.resetBtn,
                { borderColor: colors.border, backgroundColor: colors.cardSubtle },
                pressed && { opacity: 0.7 },
              ]}
            >
              <RotateCcw size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>
                Reset
              </Text>
            </Pressable>

            <View style={styles.footerRightButtons}>
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
                  Terapkan Rentang
                </Text>
              </Pressable>
            </View>
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
    maxWidth: 420,
    maxHeight: '92%',
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
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
  rangePreviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  dateBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dateBoxLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  dateBoxValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateArrowWrap: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationRow: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    fontWeight: '600',
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
  presetsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  yearControl: {
    width: 60,
  },
  yearNavBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  yearNavText: {
    fontSize: 11,
    fontWeight: '600',
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleWrap: {
    marginHorizontal: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 15,
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
    height: 44,
  },
  dayCol: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  inRangeBand: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
  },
  halfRangeRight: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: '50%',
    right: 0,
  },
  halfRangeLeft: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: '50%',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 13,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
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
