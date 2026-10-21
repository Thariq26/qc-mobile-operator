import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Camera,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Trash2,
  QrCode,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Package,
  Factory,
  Cog,
  Clock,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SpringButton } from '../../components/common/SpringButton';
import { PhotoModal } from '../../components/common/PhotoModal';
import { defectService } from '../../api/services/defectService';
import { typography } from '../../theme/typography';

// Standard Industrial Production Processes at PT Galaxy Mandiri Perkasa
const PRODUCTION_PROCESSES = [
  { id: 'Blanking', name: 'Blanking', line: 'Stamping Press', desc: 'Pemotongan lembaran plat coil' },
  { id: 'Piercing', name: 'Piercing', line: 'Stamping Press', desc: 'Pelubangan pin & lubang baut' },
  { id: 'Bending', name: 'Bending', line: 'Press Brake', desc: 'Penekukan profil sudut part plat' },
  { id: 'Drawing', name: 'Drawing', line: 'Hydraulic Press', desc: 'Penarikan kontur mangkok plat dalam' },
  { id: 'Spot Welding', name: 'Spot Welding', line: 'Welding Spot', desc: 'Pengelasan titik resistansi elektroda' },
  { id: 'Robot Welding', name: 'Robot Welding', line: 'Welding Robot', desc: 'Pengelasan kontinyu OTC Daihen Robot' },
  { id: 'ED Coating', name: 'ED Coating', line: 'Painting Line', desc: 'Pengecatan elektroforesis anti karat' },
  { id: 'Sub-Assembly', name: 'Sub-Assembly', line: 'Assembly Line', desc: 'Perakitan sub-komponen bracket' },
  { id: 'Final Visual Check', name: 'Final Visual Check', line: 'QC Final', desc: 'Inspeksi visual akhir sebelum packing' },
];

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];

/**
 * InputDefectScreen: Catat Cacat Produk (NG) Handheld Form
 * Features:
 * - Manual Shift selection (Shift 1, Shift 2, Shift 3)
 * - 100% Drop Down Lists: Part Number (All parts), Jenis Cacat (All defects), Proses Produksi (All processes), Mesin
 * - Glove-friendly tactile stepper for quantity
 * - Photo capture & gallery picker with compression
 * - Tips penanganan cepat AI removed per user requirement
 */
export const InputDefectScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Master Data
  const [parts, setParts] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [machines, setMachines] = useState([]);

  // Form State
  const [selectedShift, setSelectedShift] = useState('Shift 1');
  const [selectedPart, setSelectedPart] = useState(null);
  const [partSearchQuery, setPartSearchQuery] = useState('');

  const [selectedDefect, setSelectedDefect] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState('Blanking');
  const [selectedMachine, setSelectedMachine] = useState('Amada Press 01');
  const [quantity, setQuantity] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  // Active Dropdown Accordion State ('part' | 'defect' | 'process' | 'machine' | null)
  const [openDropdown, setOpenDropdown] = useState(null);

  // UI State
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Load master data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      const [partsList, defectsList, machinesList] = await Promise.all([
        defectService.getParts(),
        defectService.getDefectTypes(),
        defectService.getMachines(),
      ]);

      setParts(partsList);
      setDefectTypes(defectsList);
      setMachines(machinesList);

      // Default selection for seamless factory floor flow
      if (partsList.length > 0) {
        setSelectedPart(partsList[0]);
      }
      if (defectsList.length > 0) {
        setSelectedDefect(defectsList[0]);
        if (defectsList[0].proses) {
          setSelectedProcess(defectsList[0].proses);
        }
      }
      if (machinesList.length > 0) {
        setSelectedMachine(machinesList[0].name);
      }
    };

    loadMasterData();
  }, []);

  const handleSelectPart = (part) => {
    setSelectedPart(part);
    setOpenDropdown(null);
  };

  const handleSelectDefect = (defect) => {
    setSelectedDefect(defect);
    if (defect.proses) {
      setSelectedProcess(defect.proses);
    }
    setOpenDropdown(null);
  };

  const handleSelectProcess = (procName) => {
    setSelectedProcess(procName);
    setOpenDropdown(null);
  };

  const handleSelectMachine = (machName) => {
    setSelectedMachine(machName);
    setOpenDropdown(null);
  };

  // Stepper functions for quantity
  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleSubmit = async () => {
    if (!selectedPart) {
      Alert.alert('Perhatian', 'Harap pilih Part Number yang diinspeksi!');
      return;
    }
    if (!selectedDefect) {
      Alert.alert('Perhatian', 'Harap pilih jenis cacat produk!');
      return;
    }
    if (!selectedProcess) {
      Alert.alert('Perhatian', 'Harap pilih proses produksi!');
      return;
    }
    if (quantity < 1) {
      Alert.alert('Perhatian', 'Jumlah cacat minimal 1 pcs!');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedFileName = null;
      if (photoUri) {
        uploadedFileName = await defectService.uploadPhoto(photoUri);
      }

      const payload = {
        partId: selectedPart.id,
        partNumber: selectedPart.partNumber,
        partName: selectedPart.partName,
        defectTypeId: selectedDefect.id,
        defectName: selectedDefect.name,
        proses: selectedProcess,
        quantity: Number(quantity),
        operatorName: user?.fullName || 'Budi Santoso',
        username: user?.username || 'budi_qc',
        remarks: remarks.trim() || 'Pemeriksaan visual rutin lantai produksi',
        photoUrl: uploadedFileName,
        defectDate: new Date().toISOString().split('T')[0],
        shift: selectedShift,
        namaMesin: selectedMachine,
      };

      await defectService.saveDefect(payload);

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        // Reset form
        setQuantity(1);
        setRemarks('');
        setPhotoUri(null);
        Alert.alert(
          'Sukses Dicatat',
          `Data cacat ${payload.quantity} pcs ${payload.defectName} (${payload.proses}) berhasil disimpan ke database!`,
          [
            { text: 'Catat Lagi', style: 'cancel' },
            { text: 'Lihat Riwayat', onPress: () => navigation.navigate('History') },
          ]
        );
      }, 1200);
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err?.message || 'Terjadi kesalahan saat menyimpan laporan defect.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter parts if query provided, else show ALL parts
  const displayedParts = partSearchQuery.trim()
    ? parts.filter(
        (p) =>
          p.partNumber.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
          p.partName.toLowerCase().includes(partSearchQuery.toLowerCase())
      )
    : parts;

  const currentProcessDetail = PRODUCTION_PROCESSES.find(
    (p) => p.name.toLowerCase() === selectedProcess.toLowerCase()
  );

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
        <View style={styles.formHeader}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            CATAT CACAT PRODUK (NG)
          </Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Formulir inspeksi kualitas real-time lini perakitan PT Galaxy Mandiri
          </Text>
        </View>

        {/* ========================================================================= */}
        {/* PILIHAN SHIFT KERJA MANUAL (SHIFT 1, SHIFT 2, SHIFT 3)                    */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            PILIH SHIFT KERJA OPERASIONAL *
          </Text>
          <View style={styles.shiftGrid}>
            {SHIFTS.map((shiftItem) => {
              const isSelected = selectedShift === shiftItem;
              return (
                <Pressable
                  key={shiftItem}
                  onPress={() => setSelectedShift(shiftItem)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pilih ${shiftItem}`}
                  style={({ pressed }) => [
                    styles.shiftButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Clock
                    size={15}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.shiftButtonText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {shiftItem}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 1. DATA PART NUMBER - DROP DOWN LIST (ALL 121 PARTS)                      */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            PART NUMBER / NAMA PART * ({parts.length || 121} PART TERSEDIA)
          </Text>

          {/* Trigger Selector */}
          <Pressable
            onPress={() => toggleDropdown('part')}
            accessibilityRole="button"
            accessibilityLabel="Buka Drop Down List Part"
            style={[
              styles.dropdownSelector,
              {
                backgroundColor: colors.card,
                borderColor: openDropdown === 'part' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={[styles.selectorIconBadge, { backgroundColor: colors.primary + '18' }]}>
              <Package size={18} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.selectedOptionText, { color: colors.textPrimary }]}>
                {selectedPart ? `${selectedPart.partNumber} - ${selectedPart.partName}` : 'Pilih Part Number'}
              </Text>
              {selectedPart?.line && (
                <Text style={[styles.optionMetaText, { color: colors.textSecondary }]}>
                  Lini: {selectedPart.line}
                </Text>
              )}
            </View>

            {openDropdown === 'part' ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </Pressable>

          {/* Drop Down List Content (Menampilkan SEMUA Part) */}
          {openDropdown === 'part' && (
            <View
              style={[
                styles.dropdownContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Quick Search inside Dropdown */}
              <View
                style={[
                  styles.dropdownSearchBar,
                  { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                ]}
              >
                <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  value={partSearchQuery}
                  onChangeText={setPartSearchQuery}
                  placeholder={`Cari dari ${parts.length || 121} master part...`}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.dropdownSearchInput, { color: colors.textPrimary }]}
                  autoCapitalize="characters"
                />
                {partSearchQuery ? (
                  <Pressable onPress={() => setPartSearchQuery('')} hitSlop={8}>
                    <X size={16} color={colors.textMuted} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Barcode / QR Scanner',
                        'Kamera siap memindai label part tag pada kontainer pallet.',
                        [
                          {
                            text: 'Simulasi Scan PT-1001',
                            onPress: () => {
                              const pt = parts.find((p) => p.partNumber === 'PT-1001') || parts[0];
                              if (pt) handleSelectPart(pt);
                            },
                          },
                          { text: 'Batal', style: 'cancel' },
                        ]
                      );
                    }}
                    hitSlop={8}
                  >
                    <QrCode size={18} color={colors.primary} />
                  </Pressable>
                )}
              </View>

              {/* Counter Strip */}
              <View
                style={[
                  styles.dropdownCounterStrip,
                  { backgroundColor: colors.cardSubtle, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.dropdownCounterText, { color: colors.textSecondary }]}>
                  Menampilkan {displayedParts.length} dari {parts.length || 121} Part Terdaftar
                </Text>
              </View>

              {/* Scrollable list of ALL parts */}
              <ScrollView
                nestedScrollEnabled={true}
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
              >
                {displayedParts.length === 0 ? (
                  <View style={styles.emptyDropdownState}>
                    <Text style={[styles.emptyDropdownText, { color: colors.textMuted }]}>
                      Part tidak ditemukan.
                    </Text>
                  </View>
                ) : (
                  displayedParts.map((p) => {
                    const isSelected = selectedPart?.id === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => handleSelectPart(p)}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          {
                            borderBottomColor: colors.border,
                            backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
                          },
                          pressed && { backgroundColor: colors.cardSubtle },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={styles.itemTitleRow}>
                            <Text style={[styles.itemCodeText, { color: colors.primary }]}>
                              {p.partNumber}
                            </Text>
                            <Text
                              style={[styles.itemNameText, { color: colors.textPrimary }]}
                              numberOfLines={1}
                            >
                              {p.partName}
                            </Text>
                          </View>
                          {p.line ? (
                            <Text style={[styles.itemSubText, { color: colors.textSecondary }]}>
                              Lini: {p.line}
                            </Text>
                          ) : null}
                        </View>

                        {isSelected && (
                          <CheckCircle2 size={18} color={colors.primary} style={{ marginLeft: 8 }} />
                        )}
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 2. JENIS CACAT (DEFECT TYPE) - DROP DOWN LIST (ALL 33 DEFECTS)            */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            JENIS CACAT (DEFECT TYPE) * ({defectTypes.length || 33} JENIS TERSEDIA)
          </Text>

          {/* Trigger Selector */}
          <Pressable
            onPress={() => toggleDropdown('defect')}
            accessibilityRole="button"
            accessibilityLabel="Buka Drop Down List Jenis Cacat"
            style={[
              styles.dropdownSelector,
              {
                backgroundColor: colors.card,
                borderColor: openDropdown === 'defect' ? colors.primary : colors.border,
              },
            ]}
          >
            <View style={[styles.selectorIconBadge, { backgroundColor: colors.critical + '18' }]}>
              <AlertTriangle size={18} color={colors.critical} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.selectedOptionText, { color: colors.textPrimary }]}>
                {selectedDefect ? selectedDefect.name : 'Pilih Jenis Cacat'}
              </Text>
              {selectedDefect && (
                <Text style={[styles.optionMetaText, { color: colors.textSecondary }]}>
                  Kategori: {selectedDefect.category} • Proses Standar: {selectedDefect.proses}
                </Text>
              )}
            </View>

            {openDropdown === 'defect' ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </Pressable>

          {/* Drop Down List Content (Menampilkan SEMUA 33 Jenis Cacat) */}
          {openDropdown === 'defect' && (
            <View
              style={[
                styles.dropdownContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {/* Header Strip */}
              <View
                style={[
                  styles.dropdownCounterStrip,
                  { backgroundColor: colors.cardSubtle, borderBottomColor: colors.border },
                ]}
              >
                <Text style={[styles.dropdownCounterText, { color: colors.textSecondary }]}>
                  Daftar Lengkap {defectTypes.length || 33} Jenis Cacat Manufaktur
                </Text>
              </View>
              <ScrollView
                nestedScrollEnabled={true}
                style={styles.dropdownScrollView}
                showsVerticalScrollIndicator={true}
              >
                {defectTypes.map((def) => {
                  const isSelected = selectedDefect?.id === def.id;
                  const isCritical = def.category === 'Critical';
                  return (
                    <Pressable
                      key={def.id}
                      onPress={() => handleSelectDefect(def)}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        {
                          borderBottomColor: colors.border,
                          backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
                        },
                        pressed && { backgroundColor: colors.cardSubtle },
                      ]}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.dropdownDefectName, { color: colors.textPrimary }]}>
                          {def.name}
                        </Text>
                        <Text style={[styles.dropdownDefectDesc, { color: colors.textSecondary }]}>
                          {def.description}
                        </Text>
                        <Text style={[styles.itemSubText, { color: colors.textMuted, marginTop: 2 }]}>
                          Proses: {def.proses}
                        </Text>
                      </View>

                      <View style={styles.rightBadgeContainer}>
                        <View
                          style={[
                            styles.severityTag,
                            {
                              backgroundColor: isCritical
                                ? colors.critical + '20'
                                : colors.warning + '20',
                              borderColor: isCritical ? colors.critical : colors.warning,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.severityTagText,
                              { color: isCritical ? colors.critical : colors.warning },
                            ]}
                          >
                            {def.category}
                          </Text>
                        </View>
                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            color={colors.primary}
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 3. PROSES PRODUKSI & MESIN - DROP DOWN LIST                               */}
        {/* ========================================================================= */}
        <View style={styles.dualFieldRow}>
          {/* A. Proses Produksi Drop Down */}
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              PROSES PRODUKSI *
            </Text>

            <Pressable
              onPress={() => toggleDropdown('process')}
              accessibilityRole="button"
              accessibilityLabel="Pilih Proses Produksi"
              style={[
                styles.compactDropdownSelector,
                {
                  backgroundColor: colors.card,
                  borderColor: openDropdown === 'process' ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.compactIconBadge, { backgroundColor: colors.primary + '18' }]}>
                <Cog size={15} color={colors.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.compactSelectedText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {selectedProcess || 'Pilih Proses'}
                </Text>
                <Text
                  style={[styles.compactMetaText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {currentProcessDetail?.line || 'Lini Produksi'}
                </Text>
              </View>

              {openDropdown === 'process' ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>

          {/* B. Mesin / Line Drop Down */}
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              MESIN / LINE * ({machines.length || 29} MESIN TERSEDIA)
            </Text>

            <Pressable
              onPress={() => toggleDropdown('machine')}
              accessibilityRole="button"
              accessibilityLabel="Pilih Mesin Produksi"
              style={[
                styles.compactDropdownSelector,
                {
                  backgroundColor: colors.card,
                  borderColor: openDropdown === 'machine' ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.compactIconBadge, { backgroundColor: colors.warning + '18' }]}>
                <Factory size={15} color={colors.warning} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.compactSelectedText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {selectedMachine || 'Pilih Mesin'}
                </Text>
                <Text
                  style={[styles.compactMetaText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  Lini Aktif
                </Text>
              </View>

              {openDropdown === 'machine' ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Drop Down Content: PROSES PRODUKSI */}
        {openDropdown === 'process' && (
          <View
            style={[
              styles.dropdownContainer,
              { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 },
            ]}
          >
            <ScrollView
              nestedScrollEnabled={true}
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={true}
            >
              {PRODUCTION_PROCESSES.map((proc) => {
                const isSelected = selectedProcess.toLowerCase() === proc.name.toLowerCase();
                return (
                  <Pressable
                    key={proc.id}
                    onPress={() => handleSelectProcess(proc.name)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
                      },
                      pressed && { backgroundColor: colors.cardSubtle },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownDefectName, { color: colors.textPrimary }]}>
                        {proc.name}
                      </Text>
                      <Text style={[styles.dropdownDefectDesc, { color: colors.textSecondary }]}>
                        {proc.line} • {proc.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={18} color={colors.primary} style={{ marginLeft: 8 }} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Drop Down Content: MESIN */}
        {openDropdown === 'machine' && (
          <View
            style={[
              styles.dropdownContainer,
              { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 },
            ]}
          >
            {/* Header Strip */}
            <View
              style={[
                styles.dropdownCounterStrip,
                { backgroundColor: colors.cardSubtle, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.dropdownCounterText, { color: colors.textSecondary }]}>
                Daftar Lengkap {machines.length || 29} Mesin Produksi Plant
              </Text>
            </View>
            <ScrollView
              nestedScrollEnabled={true}
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={true}
            >
              {machines.map((m) => {
                const isSelected = selectedMachine === m.name;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => handleSelectMachine(m.name)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
                      },
                      pressed && { backgroundColor: colors.cardSubtle },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.dropdownDefectName, { color: colors.textPrimary }]}>
                        {m.name}
                      </Text>
                      <Text style={[styles.dropdownDefectDesc, { color: colors.textSecondary }]}>
                        {m.type}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={18} color={colors.primary} style={{ marginLeft: 8 }} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 4. JUMLAH PRODUK CACAT (QTY NG) - GLOVE-FRIENDLY STEPPER                 */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            JUMLAH PRODUK CACAT (QTY NG) *
          </Text>
          <View
            style={[
              styles.stepperContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={decrementQty}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Kurangi jumlah cacat"
              style={({ pressed }) => [
                styles.stepButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Minus size={22} color={colors.textPrimary} />
            </Pressable>

            <View style={styles.qtyDisplay}>
              <Text style={[styles.qtyNumber, { color: colors.critical }]}>
                {quantity}
              </Text>
              <Text style={[styles.qtyUnit, { color: colors.textSecondary }]}>pcs</Text>
            </View>

            <Pressable
              onPress={incrementQty}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Tambah jumlah cacat"
              style={({ pressed }) => [
                styles.stepButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Plus size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 5. FOTO BUKTI CACAT (KAMERA & GALERI)                                     */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            FOTO BUKTI CACAT (KAMERA / GALERI)
          </Text>

          {photoUri ? (
            <View style={[styles.previewContainer, { borderColor: colors.border }]}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewActions}>
                <Pressable
                  onPress={() => setPhotoModalVisible(true)}
                  style={[
                    styles.photoActionChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Camera size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.photoActionText, { color: colors.primary }]}>Ganti Foto</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPhotoUri(null)}
                  style={[
                    styles.photoActionChip,
                    { backgroundColor: colors.critical + '20', borderColor: colors.critical },
                  ]}
                >
                  <Trash2 size={14} color={colors.critical} style={{ marginRight: 4 }} />
                  <Text style={[styles.photoActionText, { color: colors.critical }]}>Hapus</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setPhotoModalVisible(true)}
              style={({ pressed }) => [
                styles.photoUploadPlaceholder,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { borderColor: colors.primary },
              ]}
            >
              <View style={[styles.photoCameraCircle, { backgroundColor: colors.primary + '1A' }]}>
                <Camera size={30} color={colors.primary} />
              </View>
              <Text style={[styles.uploadPromptTitle, { color: colors.textPrimary }]}>
                Ambil Foto Part Cacat
              </Text>
              <Text style={[styles.uploadPromptDesc, { color: colors.textSecondary }]}>
                Ketuk untuk membuka Kamera Langsung atau Galeri HP (Otomatis Kompres &lt; 1MB)
              </Text>
            </Pressable>
          )}
        </View>

        {/* ========================================================================= */}
        {/* 6. CATATAN OPERATOR (REMARKS)                                             */}
        {/* ========================================================================= */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            CATATAN OPERATOR (REMARKS / AREA KERUSAKAN)
          </Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Contoh: Sisi kiri dekat lubang punching clearance aus, lot plat baru..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            style={[
              styles.remarksInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.textPrimary,
              },
            ]}
          />
        </View>

        {/* ========================================================================= */}
        {/* 7. TOMBOL SIMPAN LAPORAN DEFECT                                           */}
        {/* ========================================================================= */}
        <View style={styles.submitSection}>
          <SpringButton
            title={submitSuccess ? 'Laporan Berhasil Dicatat!' : 'SIMPAN LAPORAN DEFECT'}
            variant="primary"
            size="large"
            loading={submitting}
            disabled={submitting || submitSuccess}
            icon={submitSuccess ? <CheckCircle2 size={20} color="#FFFFFF" /> : undefined}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Photo Picker Bottom Sheet */}
      <PhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onImageSelected={(uri) => setPhotoUri(uri)}
      />
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
  formHeader: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: typography.sizes.screenHeading + 2,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  formSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  shiftGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  shiftButtonText: {
    fontSize: typography.sizes.body,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 60,
  },
  selectorIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOptionText: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  optionMetaText: {
    fontSize: typography.sizes.caption - 0.5,
    marginTop: 2,
    fontWeight: '500',
  },
  dropdownContainer: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontWeight: '600',
    paddingVertical: 0,
  },
  dropdownCounterStrip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  dropdownCounterText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dropdownScrollView: {
    maxHeight: 280,
  },
  emptyDropdownState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyDropdownText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCodeText: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    marginRight: 8,
  },
  itemNameText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
    flex: 1,
  },
  itemSubText: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
    fontWeight: '500',
  },
  dropdownDefectName: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
  },
  dropdownDefectDesc: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  rightBadgeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  severityTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  severityTagText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '800',
  },
  dualFieldRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  compactDropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 56,
  },
  compactIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  compactSelectedText: {
    fontSize: typography.sizes.body - 0.5,
    fontWeight: '800',
  },
  compactMetaText: {
    fontSize: typography.sizes.micro - 0.5,
    marginTop: 1,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 8,
    minHeight: 64,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  qtyNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  qtyUnit: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    marginLeft: 6,
  },
  photoUploadPlaceholder: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCameraCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadPromptTitle: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '700',
  },
  uploadPromptDesc: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  previewContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 180,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    justifyContent: 'flex-end',
  },
  photoActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  photoActionText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  remarksInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    fontSize: typography.sizes.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitSection: {
    marginTop: 8,
  },
  submitButton: {
    width: '100%',
  },
});

export default InputDefectScreen;
