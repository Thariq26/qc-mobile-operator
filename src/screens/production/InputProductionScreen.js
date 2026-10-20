import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Factory,
  Calendar,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Clock,
  Save,
  AlertCircle,
  Cpu,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SpringButton } from '../../components/common/SpringButton';
import { AchievementMeter } from '../../components/production/AchievementMeter';
import { defectService } from '../../api/services/defectService';
import { productionService } from '../../api/services/productionService';
import { formatIndonesianDate } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';

const LINES = ['Stamping', 'Welding', 'Painting', 'Assembly'];

const SHIFTS = [
  { id: 'Shift 1', label: 'Shift 1 (Pagi: 07.00 - 15.30)' },
  { id: 'Shift 2', label: 'Shift 2 (Siang: 15.30 - 23.00)' },
  { id: 'Shift 3', label: 'Shift 3 (Malam: 23.00 - 07.00)' },
];

export const InputProductionScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user, currentShift } = useAuth();

  // Master Data
  const [parts, setParts] = useState([]);

  // Form Header State
  const [selectedLine, setSelectedLine] = useState('Stamping');
  const [selectedShift, setSelectedShift] = useState(currentShift || 'Shift 1');
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Batch Items State (starts with 1 item)
  const [items, setItems] = useState([
    {
      id: 1,
      machineName: 'Amada Press 01',
      partId: 1,
      partNumber: 'PT-1001',
      partName: 'Front Bracket A',
      partSearchText: 'PT-1001 - Front Bracket A',
      showPartDropdown: false,
      processName: 'Blanking',
      targetQuantity: '4000',
      producedQuantity: '4150',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Parts master data
  useEffect(() => {
    const fetchParts = async () => {
      const partsData = await defectService.getParts();
      setParts(partsData);

      // Initialize default part if available
      if (partsData.length > 0 && items.length === 1 && items[0].partId === 1) {
        setItems([
          {
            ...items[0],
            partId: partsData[0].id,
            partNumber: partsData[0].partNumber,
            partName: partsData[0].partName,
            partSearchText: `${partsData[0].partNumber} - ${partsData[0].partName}`,
          },
        ]);
      }
    };

    fetchParts();
  }, []);

  // When line changes, update default machine and process for items
  const handleLineChange = (newLine) => {
    setSelectedLine(newLine);
    const availableMachines = productionService.getMachinesByLine(newLine);
    const availableProcesses = productionService.getProcessesByLine(newLine);

    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        machineName: availableMachines[0] || item.machineName,
        processName: availableProcesses[0] || item.processName,
      }))
    );
  };

  // Add new machine item to batch
  const handleAddItem = () => {
    const availableMachines = productionService.getMachinesByLine(selectedLine);
    const availableProcesses = productionService.getProcessesByLine(selectedLine);
    const defaultPart = parts[0] || { id: 1, partNumber: 'PT-1001', partName: 'Front Bracket A' };

    // Select next machine in line list if available
    const nextMachineIndex = items.length % availableMachines.length;
    const nextMachine = availableMachines[nextMachineIndex] || availableMachines[0];

    const newItem = {
      id: Date.now(),
      machineName: nextMachine,
      partId: defaultPart.id,
      partNumber: defaultPart.partNumber,
      partName: defaultPart.partName,
      partSearchText: `${defaultPart.partNumber} - ${defaultPart.partName}`,
      showPartDropdown: false,
      processName: availableProcesses[0] || 'Blanking',
      targetQuantity: '3000',
      producedQuantity: '3000',
    };

    setItems([...items, newItem]);
  };

  // Remove machine item from batch
  const handleRemoveItem = (itemId) => {
    if (items.length <= 1) {
      Alert.alert('Perhatian', 'Minimal harus ada 1 item mesin yang dicatat!');
      return;
    }
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update specific field in item
  const updateItemField = (itemId, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Select part for item
  const handleSelectPart = (itemId, part) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            partId: part.id,
            partNumber: part.partNumber,
            partName: part.partName,
            partSearchText: `${part.partNumber} - ${part.partName}`,
            showPartDropdown: false,
          };
        }
        return item;
      })
    );
  };

  // Validate and submit batch production
  const handleSubmit = async () => {
    setErrorMessage('');

    // Strict validation
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const targetNum = Number(item.targetQuantity);
      const producedNum = Number(item.producedQuantity);

      if (!item.partId) {
        setErrorMessage(`Mesin #${i + 1} (${item.machineName}): Harap pilih Part Number yang valid!`);
        return;
      }
      if (isNaN(targetNum) || targetNum <= 0) {
        setErrorMessage(`Mesin #${i + 1} (${item.machineName}): Target produksi harus lebih besar dari 0 pcs!`);
        return;
      }
      if (isNaN(producedNum) || producedNum < 0) {
        setErrorMessage(`Mesin #${i + 1} (${item.machineName}): Hasil aktual tidak boleh negatif!`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        productionDate,
        shift: selectedShift,
        line: selectedLine,
        operatorName: user?.fullName || 'Budi Santoso',
        username: user?.username || 'budi_qc',
        createdBy: user?.username || 'budi_qc',
        items: items.map((item) => ({
          machineName: item.machineName,
          partId: Number(item.partId),
          partNumber: item.partNumber,
          partName: item.partName,
          processName: item.processName,
          targetQuantity: Number(item.targetQuantity),
          producedQuantity: Number(item.producedQuantity),
        })),
      };

      const result = await productionService.saveBatchProduction(payload);

      Alert.alert(
        'Produksi Berhasil Dicatat!',
        `Data ${items.length} mesin pada lini ${selectedLine} (${selectedShift}) berhasil disimpan ke sistem cloud!`,
        [
          {
            text: 'Lihat Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
          },
          {
            text: 'Input Baru',
            style: 'cancel',
            onPress: () => {
              // Reset items
              setItems([
                {
                  id: Date.now(),
                  machineName: productionService.getMachinesByLine(selectedLine)[0],
                  partId: parts[0]?.id || 1,
                  partNumber: parts[0]?.partNumber || 'PT-1001',
                  partName: parts[0]?.partName || 'Front Bracket A',
                  partSearchText: parts[0] ? `${parts[0].partNumber} - ${parts[0].partName}` : 'PT-1001',
                  showPartDropdown: false,
                  processName: productionService.getProcessesByLine(selectedLine)[0],
                  targetQuantity: '4000',
                  producedQuantity: '4000',
                },
              ]);
            },
          },
        ]
      );
    } catch (err) {
      setErrorMessage(err?.message || 'Gagal menyimpan data produksi. Silakan periksa jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const machinesForLine = productionService.getMachinesByLine(selectedLine);
  const processesForLine = productionService.getProcessesByLine(selectedLine);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* A. Header & Shift Context Card */}
        <View style={styles.headerContextContainer}>
          <View style={styles.titleRow}>
            <View style={[styles.headerIconWrapper, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '40' }]}>
              <Factory size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                INPUT PRODUKSI HARIAN
              </Text>
              <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                {user?.fullName || 'Budi Santoso'} • {selectedShift}
              </Text>
            </View>
          </View>

          {/* Date Context Card */}
          <View style={[styles.dateContextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.dateRow}>
              <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatIndonesianDate(productionDate)}
              </Text>
            </View>
            <Text style={[styles.dateMeta, { color: colors.textSecondary }]}>
              Tanggal Pencatatan Shift Aktif
            </Text>
          </View>
        </View>

        {/* Error Alert Banner if validation fails */}
        {errorMessage ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.critical + '1A', borderColor: colors.critical }]}>
            <AlertCircle size={16} color={colors.critical} style={{ marginRight: 6 }} />
            <Text style={[styles.errorText, { color: colors.critical }]}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* B. Pilihan Lini Produksi (Segmented Control Pills) */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            PILIH LINI PRODUKSI (PRODUCTION LINE) *
          </Text>
          <View style={[styles.segmentedLineContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LINES.map((line) => {
              const isSelected = selectedLine === line;
              return (
                <Pressable
                  key={line}
                  onPress={() => handleLineChange(line)}
                  style={[
                    styles.lineTab,
                    isSelected && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.lineTabText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {line}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* C. Pilihan Shift Kerja */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            SHIFT KERJA OPERASIONAL *
          </Text>
          <View style={styles.shiftSelectionGroup}>
            {SHIFTS.map((s) => {
              const isSelected = selectedShift === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedShift(s.id)}
                  style={[
                    styles.shiftOptionPill,
                    {
                      backgroundColor: isSelected ? colors.primary + '18' : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.radioCircle, { borderColor: isSelected ? colors.primary : colors.textMuted }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text
                    style={[
                      styles.shiftOptionLabel,
                      {
                        color: isSelected ? colors.primary : colors.textPrimary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* D. Form Item Produksi Mesin (Multi-Item Batch Support) */}
        <View style={styles.sectionBlock}>
          <View style={styles.itemsHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
              DETAIL HASIL PRODUKSI MESIN ({items.length} MESIN)
            </Text>
            <Pressable
              onPress={handleAddItem}
              style={[styles.addInlineBtn, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}
            >
              <Plus size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.addInlineBtnText, { color: colors.primary }]}>
                Tambah Mesin
              </Text>
            </Pressable>
          </View>

          {items.map((item, index) => {
            const filteredParts = parts.filter(
              (p) =>
                p.partNumber.toLowerCase().includes((item.partSearchText || '').toLowerCase()) ||
                p.partName.toLowerCase().includes((item.partSearchText || '').toLowerCase())
            );

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Item Card Header */}
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemIndexBadge}>
                    <Cpu size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.itemIndexTitle, { color: colors.textPrimary }]}>
                      Mesin #{index + 1}: {item.machineName}
                    </Text>
                  </View>

                  {items.length > 1 && (
                    <Pressable
                      onPress={() => handleRemoveItem(item.id)}
                      hitSlop={8}
                      style={[styles.deleteItemBtn, { backgroundColor: colors.critical + '1A' }]}
                    >
                      <Trash2 size={15} color={colors.critical} />
                    </Pressable>
                  )}
                </View>

                {/* 1. Pilih Nama Mesin (Quick Chips) */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                    NAMA MESIN:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {machinesForLine.map((m) => {
                      const isSelected = item.machineName === m;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => updateItemField(item.id, 'machineName', m)}
                          style={[
                            styles.chipBtn,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.cardSubtle,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipBtnText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}
                          >
                            {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 2. Part Number Autocomplete */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                    PART NUMBER & NAMA PART *
                  </Text>
                  <View style={[styles.partSearchInputWrapper, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                    <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                      value={item.partSearchText}
                      onChangeText={(txt) => {
                        updateItemField(item.id, 'partSearchText', txt);
                        updateItemField(item.id, 'showPartDropdown', true);
                      }}
                      onFocus={() => updateItemField(item.id, 'showPartDropdown', true)}
                      placeholder="Cari PT-1001 atau Bracket..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.partSearchInput, { color: colors.textPrimary }]}
                    />
                  </View>

                  {/* Autocomplete Suggestions (All 121 Parts) */}
                  {item.showPartDropdown && (
                    <View style={[styles.partDropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 200 }}>
                        {filteredParts.map((p) => (
                          <Pressable
                            key={p.id}
                            onPress={() => handleSelectPart(item.id, p)}
                            style={({ pressed }) => [
                              styles.partDropdownItem,
                              { borderBottomColor: colors.border },
                              pressed && { backgroundColor: colors.cardSubtle },
                            ]}
                          >
                            <Text style={[styles.dropdownPartNumber, { color: colors.primary }]}>
                              {p.partNumber}
                            </Text>
                            <Text style={[styles.dropdownPartName, { color: colors.textPrimary }]}>
                              {p.partName}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* 3. Nama Proses (Chips) */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                    PROSES OPERASIONAL:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {processesForLine.map((proc) => {
                      const isSelected = item.processName === proc;
                      return (
                        <Pressable
                          key={proc}
                          onPress={() => updateItemField(item.id, 'processName', proc)}
                          style={[
                            styles.chipBtn,
                            {
                              backgroundColor: isSelected ? colors.aiAccent : colors.cardSubtle,
                              borderColor: isSelected ? colors.aiAccent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipBtnText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}
                          >
                            {proc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 4 & 5. Target Produksi vs Aktual Jadi (Side by Side) */}
                <View style={styles.dualQtyRow}>
                  {/* Target Produksi */}
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                      TARGET (PCS) *
                    </Text>
                    <View style={[styles.qtyInputBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                      <TextInput
                        value={String(item.targetQuantity)}
                        onChangeText={(txt) => {
                          const sanitized = txt.replace(/[^0-9]/g, '');
                          updateItemField(item.id, 'targetQuantity', sanitized);
                        }}
                        keyboardType="numeric"
                        placeholder="4000"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.bigNumericInput, { color: colors.textPrimary }]}
                      />
                      <Text style={[styles.unitLabel, { color: colors.textMuted }]}>pcs</Text>
                    </View>
                  </View>

                  {/* Aktual Jadi */}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                      AKTUAL HASIL (PCS) *
                    </Text>
                    <View style={[styles.qtyInputBox, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
                      <TextInput
                        value={String(item.producedQuantity)}
                        onChangeText={(txt) => {
                          const sanitized = txt.replace(/[^0-9]/g, '');
                          updateItemField(item.id, 'producedQuantity', sanitized);
                        }}
                        keyboardType="numeric"
                        placeholder="4150"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.bigNumericInput, { color: colors.primary }]}
                      />
                      <Text style={[styles.unitLabel, { color: colors.textMuted }]}>pcs</Text>
                    </View>
                  </View>
                </View>

                {/* 6. Live Achievement Card (Bento Meter Calculation) */}
                <AchievementMeter
                  target={Number(item.targetQuantity)}
                  actual={Number(item.producedQuantity)}
                />
              </View>
            );
          })}
        </View>

        {/* Tombol Tambah Mesin Lain */}
        <View style={styles.addMoreContainer}>
          <SpringButton
            title="+ Tambah Mesin Lain dalam Shift Ini"
            variant="outline"
            onPress={handleAddItem}
            style={{ width: '100%' }}
          />
        </View>

        {/* Tombol Simpan Produksi */}
        <View style={styles.saveContainer}>
          <SpringButton
            title="SIMPAN DATA PRODUKSI"
            variant="primary"
            size="large"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            style={styles.saveButton}
          />
          <Text style={[styles.saveFooterNotice, { color: colors.textMuted }]}>
            Data akan disinkronkan ke Supabase dan langsung memperbarui metrik Dashboard.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContextContainer: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  screenTitle: {
    fontSize: typography.sizes.screenHeading + 2,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
    fontWeight: '600',
  },
  dateContextCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
  },
  dateMeta: {
    fontSize: typography.sizes.caption - 1,
    marginTop: 3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    flex: 1,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  segmentedLineContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 4,
  },
  lineTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineTabText: {
    fontSize: typography.sizes.caption,
    letterSpacing: 0.3,
  },
  shiftSelectionGroup: {
    gap: 8,
  },
  shiftOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 48,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  shiftOptionLabel: {
    fontSize: typography.sizes.caption + 1,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addInlineBtnText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIndexTitle: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
  },
  deleteItemBtn: {
    padding: 8,
    borderRadius: 8,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  subFieldLabel: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipBtnText: {
    fontSize: typography.sizes.caption,
  },
  partSearchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  partSearchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
  partDropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  partDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  dropdownPartNumber: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
  dropdownPartName: {
    fontSize: typography.sizes.caption,
    marginTop: 1,
  },
  dualQtyRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  qtyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  bigNumericInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
  },
  unitLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    marginLeft: 4,
  },
  addMoreContainer: {
    marginBottom: 16,
  },
  saveContainer: {
    marginTop: 4,
  },
  saveButton: {
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  saveFooterNotice: {
    fontSize: typography.sizes.micro,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default InputProductionScreen;
