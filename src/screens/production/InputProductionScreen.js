import React, { useState, useEffect, useMemo } from 'react';
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
  Modal,
  FlatList,
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
  AlertCircle,
  Cpu,
  ChevronDown,
  X,
  Package,
  Check,
  Filter,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { SpringButton } from '../../components/common/SpringButton';
import { AchievementMeter } from '../../components/production/AchievementMeter';
import { ConfirmProductionModal } from '../../components/common/ConfirmProductionModal';
import { defectService } from '../../api/services/defectService';
import { productionService } from '../../api/services/productionService';
import { formatIndonesianDate, getLocalDateString } from '../../utils/dateFormatter';
import { typography } from '../../theme/typography';
import { MASTER_PARTS, MASTER_MACHINES } from '../../data/masterData';

// Shift options
const SHIFTS = [
  { id: 'Shift 1', label: 'Shift 1 (Pagi: 07.00 - 15.30)' },
  { id: 'Shift 2', label: 'Shift 2 (Siang: 15.30 - 23.00)' },
];

// Production line filters
const LINES = ['Semua Lini', 'Stamping', 'Bending', 'Welding', 'Painting', 'Assembly'];

// Comprehensive Operational Processes (16 Processes across 4 Manufacturing Lines)
const OPERATIONAL_PROCESSES = [
  // 1. Stamping & Forming
  { id: 'Blanking', name: 'Blanking', category: 'Stamping & Forming', line: 'Stamping', desc: 'Pemotongan lembaran plat coil' },
  { id: 'Piercing', name: 'Piercing', category: 'Stamping & Forming', line: 'Stamping', desc: 'Pelubangan pin & lubang baut' },
  { id: 'Bending', name: 'Bending', category: 'Stamping & Forming', line: 'Bending', desc: 'Penekukan profil sudut part plat' },
  { id: 'Drawing', name: 'Drawing', category: 'Stamping & Forming', line: 'Stamping', desc: 'Penarikan kontur plat dalam (deep draw)' },

  // 2. Welding
  { id: 'Spot Welding', name: 'Spot Welding', category: 'Welding', line: 'Welding', desc: 'Pengelasan titik resistansi elektroda' },
  { id: 'Robot Welding', name: 'Robot Welding', category: 'Welding', line: 'Welding', desc: 'Pengelasan kontinyu OTC Daihen Robot' },
  { id: 'Arc Welding', name: 'Arc Welding', category: 'Welding', line: 'Welding', desc: 'Pengelasan manual CO2 / MIG Arc' },
  { id: 'Projection Welding', name: 'Projection Welding', category: 'Welding', line: 'Welding', desc: 'Pengelasan nut projection & bolt stud' },

  // 3. Finishing & Painting
  { id: 'Degreasing', name: 'Degreasing', category: 'Finishing & Painting', line: 'Painting', desc: 'Pembersihan oli & residu kimia plat' },
  { id: 'ED Coating', name: 'ED Coating', category: 'Finishing & Painting', line: 'Painting', desc: 'Pengecatan elektroforesis anti karat' },
  { id: 'Top Coat Spraying', name: 'Top Coat Spraying', category: 'Finishing & Painting', line: 'Painting', desc: 'Pengecatan semprot warna akhir' },
  { id: 'Baking Oven', name: 'Baking Oven', category: 'Finishing & Painting', line: 'Painting', desc: 'Pemanasan oven pengeringan cat' },

  // 4. Assembly
  { id: 'Sub-Assembly', name: 'Sub-Assembly', category: 'Assembly', line: 'Assembly', desc: 'Perakitan sub-komponen bracket' },
  { id: 'Riveting', name: 'Riveting', category: 'Assembly', line: 'Assembly', desc: 'Pemasangan paku keling permanen' },
  { id: 'Bolting & Torque', name: 'Bolting & Torque', category: 'Assembly', line: 'Assembly', desc: 'Pengencangan baut torsi standar' },
  { id: 'Final Visual Check', name: 'Final Visual Check', category: 'Assembly', line: 'Assembly', desc: 'Inspeksi visual akhir sebelum packing' },
];

const PROCESS_FILTER_TABS = [
  'Rekomendasi Lini',
  'Semua Proses',
  'Stamping & Forming',
  'Welding',
  'Finishing & Painting',
  'Assembly',
];

export const InputProductionScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  // Master Data
  const [parts, setParts] = useState(MASTER_PARTS);
  const [machines, setMachines] = useState(MASTER_MACHINES);

  // Form Global State
  const [selectedShift, setSelectedShift] = useState('Shift 1');
  const [productionDate, setProductionDate] = useState(getLocalDateString());

  // Batch Items State (starts with 1 item)
  const [items, setItems] = useState([
    {
      id: 1,
      machineName: 'Amada Press 01',
      machineLine: 'Stamping',
      machineType: 'Mechanical Press 150 Ton',
      partId: 1,
      partNumber: 'PT-1001',
      partName: 'Front Bracket A',
      partLine: 'Stamping',
      processName: 'Blanking',
      processCategoryTab: 'Rekomendasi Lini',
      isCustomProcess: false,
      customProcess: '',
      targetQuantity: '',
      producedQuantity: '',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal Control States
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [activeItemIndexForPart, setActiveItemIndexForPart] = useState(null);
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [partLineFilter, setPartLineFilter] = useState('Semua');

  const [machineModalVisible, setMachineModalVisible] = useState(false);
  const [activeItemIndexForMachine, setActiveItemIndexForMachine] = useState(null);
  const [machineSearchQuery, setMachineSearchQuery] = useState('');
  const [machineLineFilter, setMachineLineFilter] = useState('Semua');

  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [activeItemIndexForProcess, setActiveItemIndexForProcess] = useState(null);
  const [processSearchQuery, setProcessSearchQuery] = useState('');
  const [processCategoryFilter, setProcessCategoryFilter] = useState('Semua');
  const [customProcessTemp, setCustomProcessTemp] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Load complete Master Data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [partsList, machinesList] = await Promise.all([
          defectService.getParts(),
          defectService.getMachines(),
        ]);

        const validParts = Array.isArray(partsList) && partsList.length > 0 ? partsList : MASTER_PARTS;
        const validMachines = Array.isArray(machinesList) && machinesList.length > 0 ? machinesList : MASTER_MACHINES;

        setParts(validParts);
        setMachines(validMachines);

        // Synchronize first item with verified master data
        if (validParts.length > 0 && validMachines.length > 0) {
          setItems((prevItems) => {
            if (prevItems.length === 1 && prevItems[0].partId === 1) {
              const p0 = validParts[0];
              const m0 = validMachines[0];
              return [
                {
                  ...prevItems[0],
                  machineName: m0.name,
                  machineLine: m0.line,
                  machineType: m0.type || 'Mesin Produksi',
                  partId: p0.id,
                  partNumber: p0.partNumber,
                  partName: p0.partName,
                  partLine: p0.line || 'Stamping',
                },
              ];
            }
            return prevItems;
          });
        }
      } catch (err) {
        console.warn('Gagal memuat master data produksi:', err);
      }
    };

    loadMasterData();
  }, []);

  // Open Part Selector Modal for a specific item index
  const handleOpenPartModal = (index) => {
    setActiveItemIndexForPart(index);
    setPartSearchQuery('');
    setPartLineFilter('Semua');
    setPartModalVisible(true);
  };

  // Select Part from Modal
  const handleSelectPart = (part) => {
    if (activeItemIndexForPart !== null) {
      setItems((prevItems) =>
        prevItems.map((item, idx) => {
          if (idx === activeItemIndexForPart) {
            return {
              ...item,
              partId: part.id,
              partNumber: part.partNumber,
              partName: part.partName,
              partLine: part.line || 'Stamping',
            };
          }
          return item;
        })
      );
    }
    setPartModalVisible(false);
    setActiveItemIndexForPart(null);
  };

  // Open Machine Selector Modal for a specific item index
  const handleOpenMachineModal = (index) => {
    setActiveItemIndexForMachine(index);
    setMachineSearchQuery('');
    setMachineLineFilter('Semua');
    setMachineModalVisible(true);
  };

  // Select Machine from Modal & auto-suggest default process for that machine
  const handleSelectMachine = (machine) => {
    if (activeItemIndexForMachine !== null) {
      const defaultProc = getRecommendedProcessForLine(machine.line);
      setItems((prevItems) =>
        prevItems.map((item, idx) => {
          if (idx === activeItemIndexForMachine) {
            return {
              ...item,
              machineName: machine.name,
              machineLine: machine.line,
              machineType: machine.type || 'Mesin Produksi',
              processName: defaultProc,
              isCustomProcess: false,
              customProcess: '',
            };
          }
          return item;
        })
      );
    }
    setMachineModalVisible(false);
    setActiveItemIndexForMachine(null);
  };

  // Open Process Selector Modal for a specific item index
  const handleOpenProcessModal = (index) => {
    setActiveItemIndexForProcess(index);
    const item = items[index];
    setProcessSearchQuery('');
    setProcessCategoryFilter('Semua');
    setCustomProcessTemp(item?.isCustomProcess ? item.customProcess : '');
    setProcessModalVisible(true);
  };

  // Select Process from Modal
  const handleSelectProcess = (proc) => {
    if (activeItemIndexForProcess !== null) {
      const targetId = items[activeItemIndexForProcess]?.id;
      if (targetId) {
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (item.id === targetId) {
              return {
                ...item,
                processName: proc.name,
                isCustomProcess: false,
                customProcess: '',
              };
            }
            return item;
          })
        );
      }
    }
    setProcessModalVisible(false);
    setActiveItemIndexForProcess(null);
  };

  // Apply Custom Process from Modal
  const handleApplyCustomProcess = (customName) => {
    const trimmed = (customName || customProcessTemp).trim();
    if (!trimmed) {
      Alert.alert('Perhatian', 'Nama proses kustom tidak boleh kosong!');
      return;
    }
    if (activeItemIndexForProcess !== null) {
      const targetId = items[activeItemIndexForProcess]?.id;
      if (targetId) {
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (item.id === targetId) {
              return {
                ...item,
                processName: trimmed,
                isCustomProcess: true,
                customProcess: trimmed,
              };
            }
            return item;
          })
        );
      }
    }
    setProcessModalVisible(false);
    setActiveItemIndexForProcess(null);
  };

  // Helper to suggest appropriate process based on machine line
  const getRecommendedProcessForLine = (lineName) => {
    const l = (lineName || '').toLowerCase();
    if (l.includes('weld')) return 'Spot Welding';
    if (l.includes('bend')) return 'Bending';
    if (l.includes('paint') || l.includes('coat')) return 'ED Coating';
    if (l.includes('assem')) return 'Sub-Assembly';
    return 'Blanking';
  };

  // Add new machine item to batch
  const handleAddItem = () => {
    const nextMachineIndex = items.length % machines.length;
    const nextMachine = machines[nextMachineIndex] || machines[0] || {
      name: 'Amada Press 01',
      line: 'Stamping',
      type: 'Mechanical Press',
    };
    const defaultPart = parts[items.length % parts.length] || parts[0] || {
      id: 1,
      partNumber: 'PT-1001',
      partName: 'Front Bracket A',
      line: 'Stamping',
    };
    const defaultProcess = getRecommendedProcessForLine(nextMachine.line);

    const newItem = {
      id: Date.now(),
      machineName: nextMachine.name,
      machineLine: nextMachine.line,
      machineType: nextMachine.type || 'Mesin Produksi',
      partId: defaultPart.id,
      partNumber: defaultPart.partNumber,
      partName: defaultPart.partName,
      partLine: defaultPart.line || 'Stamping',
      processName: defaultProcess,
      processCategoryTab: 'Rekomendasi Lini',
      isCustomProcess: false,
      customProcess: '',
      targetQuantity: '',
      producedQuantity: '',
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

  // Dynamic Quick-Pick Processes for each item (auto-adapted to machine line + currently selected process)
  const getQuickPickProcessesForItem = (item) => {
    const line = (item.machineLine || '').toLowerCase();
    let baseList = [];
    if (line.includes('bend')) {
      baseList = OPERATIONAL_PROCESSES.filter((p) => p.line === 'Bending' || p.category.includes('Stamping'));
    } else if (line.includes('weld')) {
      baseList = OPERATIONAL_PROCESSES.filter((p) => p.category === 'Welding');
    } else if (line.includes('paint') || line.includes('finish') || line.includes('coat')) {
      baseList = OPERATIONAL_PROCESSES.filter((p) => p.category === 'Finishing & Painting');
    } else if (line.includes('assem')) {
      baseList = OPERATIONAL_PROCESSES.filter((p) => p.category === 'Assembly');
    } else {
      baseList = OPERATIONAL_PROCESSES.filter((p) => p.category === 'Stamping & Forming');
    }

    // Ensure the item's currently selected standard process is present in the quick-pick chips if not custom
    if (!item.isCustomProcess && item.processName) {
      const alreadyPresent = baseList.some((p) => p.name === item.processName);
      if (!alreadyPresent) {
        const currentProc = OPERATIONAL_PROCESSES.find((p) => p.name === item.processName);
        if (currentProc) {
          baseList = [currentProc, ...baseList];
        }
      }
    }

    return baseList;
  };

  // Filter Parts in Modal
  const modalFilteredParts = useMemo(() => {
    return parts.filter((p) => {
      const matchesSearch =
        p.partNumber.toLowerCase().includes(partSearchQuery.toLowerCase()) ||
        p.partName.toLowerCase().includes(partSearchQuery.toLowerCase());
      const matchesLine =
        partLineFilter === 'Semua' || (p.line || '').toLowerCase() === partLineFilter.toLowerCase();
      return matchesSearch && matchesLine;
    });
  }, [parts, partSearchQuery, partLineFilter]);

  // Line filter tabs for Machine Selection Modal with real counts
  const machineLineTabs = useMemo(() => {
    const counts = { Semua: machines.length };
    machines.forEach((m) => {
      const rawLine = (m.line || 'Lainnya').trim();
      let category = rawLine;
      if (rawLine.toLowerCase().includes('stamping')) {
        category = 'Stamping';
      } else if (rawLine.toLowerCase().includes('welding')) {
        category = 'Welding';
      } else if (rawLine.toLowerCase().includes('bending')) {
        category = 'Bending';
      } else if (rawLine.toLowerCase().includes('painting')) {
        category = 'Painting';
      }
      counts[category] = (counts[category] || 0) + 1;
    });

    const standardTabs = ['Semua', 'Stamping', 'Bending', 'Welding', 'Painting'];
    const available = standardTabs.filter((t) => t === 'Semua' || (counts[t] && counts[t] > 0));

    // Also include any other unique lines that exist in machines
    Object.keys(counts).forEach((k) => {
      if (!available.includes(k) && counts[k] > 0) {
        available.push(k);
      }
    });

    return available.map((tab) => ({
      name: tab,
      count: counts[tab] || 0,
    }));
  }, [machines]);

  // Filter Machines in Modal
  const modalFilteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const query = machineSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (m.name || '').toLowerCase().includes(query) ||
        (m.line || '').toLowerCase().includes(query) ||
        (m.type || '').toLowerCase().includes(query);

      if (machineLineFilter === 'Semua') {
        return matchesSearch;
      }

      const mLine = (m.line || '').toLowerCase();
      const filterLower = machineLineFilter.toLowerCase();
      const matchesLine = mLine.includes(filterLower);

      return matchesSearch && matchesLine;
    });
  }, [machines, machineSearchQuery, machineLineFilter]);

  // Filter Processes in Modal
  const modalFilteredProcesses = useMemo(() => {
    const q = processSearchQuery.trim().toLowerCase();
    return OPERATIONAL_PROCESSES.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      if (processCategoryFilter === 'Semua') {
        return matchesSearch;
      }
      return (
        matchesSearch &&
        (p.category.toLowerCase().includes(processCategoryFilter.toLowerCase()) ||
          (p.line && p.line.toLowerCase().includes(processCategoryFilter.toLowerCase())))
      );
    });
  }, [processSearchQuery, processCategoryFilter]);

  // Category filter tabs for Process Modal with real counts
  const processCategoryTabs = useMemo(() => {
    return [
      { name: 'Semua', count: OPERATIONAL_PROCESSES.length },
      { name: 'Stamping', count: OPERATIONAL_PROCESSES.filter((p) => p.category.includes('Stamping')).length },
      { name: 'Welding', count: OPERATIONAL_PROCESSES.filter((p) => p.category === 'Welding').length },
      { name: 'Painting', count: OPERATIONAL_PROCESSES.filter((p) => p.category.includes('Finishing')).length },
      { name: 'Assembly', count: OPERATIONAL_PROCESSES.filter((p) => p.category === 'Assembly').length },
    ];
  }, []);

  // 1. Validate fields and trigger confirmation popup
  const handlePressSubmit = () => {
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
      if (item.isCustomProcess && !item.customProcess.trim()) {
        setErrorMessage(`Mesin #${i + 1} (${item.machineName}): Harap isi nama proses kustom yang digunakan!`);
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

    // Open confirmation popup
    setConfirmModalVisible(true);
  };

  // 2. Confirmed by user in modal -> Execute actual database save
  const handleConfirmSubmit = async () => {
    setSubmitting(true);

    try {
      const distinctLines = [...new Set(items.map((i) => i.machineLine).filter(Boolean))];
      const batchLine = distinctLines.length === 1 ? distinctLines[0] : (items[0]?.machineLine || 'Stamping');

      const payload = {
        productionDate,
        shift: selectedShift,
        line: batchLine,
        operatorName: user?.fullName || user?.username || 'Operator',
        username: user?.username || 'operator',
        createdBy: user?.username || 'operator',
        items: items.map((item) => ({
          machineName: item.machineName,
          line: item.machineLine || batchLine,
          partId: Number(item.partId),
          partNumber: item.partNumber,
          partName: item.partName,
          processName: item.isCustomProcess && item.customProcess.trim() ? item.customProcess.trim() : item.processName,
          targetQuantity: Number(item.targetQuantity),
          producedQuantity: Number(item.producedQuantity),
        })),
      };

      await productionService.saveBatchProduction(payload);

      setConfirmModalVisible(false);

      Alert.alert(
        'Produksi Berhasil Dicatat!',
        `Data ${items.length} mesin (${selectedShift}) berhasil disimpan ke sistem!`,
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
                  machineName: machines[0]?.name || 'Amada Press 01',
                  machineLine: machines[0]?.line || 'Stamping',
                  machineType: machines[0]?.type || 'Mechanical Press 150 Ton',
                  partId: parts[0]?.id || 1,
                  partNumber: parts[0]?.partNumber || 'PT-1001',
                  partName: parts[0]?.partName || 'Front Bracket A',
                  partLine: parts[0]?.line || 'Stamping',
                  processName: 'Blanking',
                  isCustomProcess: false,
                  customProcess: '',
                  targetQuantity: '',
                  producedQuantity: '',
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

  const activeItemForPart = activeItemIndexForPart !== null ? items[activeItemIndexForPart] : null;
  const activeItemForMachine = activeItemIndexForMachine !== null ? items[activeItemIndexForMachine] : null;
  const activeItemForProcess = activeItemIndexForProcess !== null ? items[activeItemIndexForProcess] : null;

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
            <View
              style={[
                styles.headerIconWrapper,
                { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '40' },
              ]}
            >
              <Factory size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
                INPUT PRODUKSI HARIAN
              </Text>
              <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
                {user?.fullName || user?.username || 'Operator'} • {selectedShift}
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
              Tanggal Pencatatan Shift Kerja Pabrik
            </Text>
          </View>
        </View>

        {/* Error Alert Banner if validation fails */}
        {errorMessage ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: colors.critical + '1A', borderColor: colors.critical },
            ]}
          >
            <AlertCircle size={16} color={colors.critical} style={{ marginRight: 6 }} />
            <Text style={[styles.errorText, { color: colors.critical }]}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* B. Pilihan Shift Kerja Operasional */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            PILIH SHIFT KERJA OPERASIONAL *
          </Text>
          <View style={styles.shiftGrid}>
            {SHIFTS.map((s) => {
              const isSelected = selectedShift === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedShift(s.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pilih ${s.id}`}
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
                    {s.id}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* C. Form Item Produksi Mesin (Multi-Item Batch Support) */}
        <View style={styles.sectionBlock}>
          <View style={styles.itemsHeaderRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]} numberOfLines={1}>
                DETAIL PRODUKSI PER MESIN ({items.length} MESIN)
              </Text>
              <Text style={[styles.sectionHint, { color: colors.textMuted }]} numberOfLines={1}>
                Tersedia 29 Mesin & 121 Master Part PT GMP
              </Text>
            </View>
            <Pressable
              onPress={handleAddItem}
              hitSlop={8}
              style={[
                styles.addInlineBtn,
                { backgroundColor: colors.primary + '18', borderColor: colors.primary },
              ]}
            >
              <Plus size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.addInlineBtnText, { color: colors.primary }]}>
                Tambah Mesin
              </Text>
            </Pressable>
          </View>

          {items.map((item, index) => {
            const quickPickProcesses = getQuickPickProcessesForItem(item);

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
                {/* 1. Item Card Header */}
                <View style={styles.itemCardHeader}>
                  <View style={styles.itemIndexBadge}>
                    <View style={[styles.indexNumberCircle, { backgroundColor: colors.primary }]}>
                      <Text style={styles.indexNumberText}>{index + 1}</Text>
                    </View>
                    <View>
                      <Text style={[styles.itemIndexTitle, { color: colors.textPrimary }]}>
                        {item.machineName}
                      </Text>
                      <Text style={[styles.itemIndexSubtitle, { color: colors.textSecondary }]}>
                        {item.machineLine} • {item.partNumber}
                      </Text>
                    </View>
                  </View>

                  {items.length > 1 && (
                    <Pressable
                      onPress={() => handleRemoveItem(item.id)}
                      hitSlop={8}
                      style={[styles.deleteItemBtn, { backgroundColor: colors.critical + '1A' }]}
                    >
                      <Trash2 size={16} color={colors.critical} />
                    </Pressable>
                  )}
                </View>

                {/* 2. PILIH MESIN PRODUKSI (Trigger Card -> Modal 29 Mesin) */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                    1. MESIN OPERASIONAL * ({machines.length} MESIN PABRIK TERSEDIA)
                  </Text>
                  <Pressable
                    onPress={() => handleOpenMachineModal(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Pilih mesin untuk item ${index + 1}`}
                    style={({ pressed }) => [
                      styles.selectorTriggerCard,
                      {
                        backgroundColor: colors.cardSubtle,
                        borderColor: colors.border,
                      },
                      pressed && { borderColor: colors.primary },
                    ]}
                  >
                    <View style={[styles.selectorIconCircle, { backgroundColor: colors.warning + '18' }]}>
                      <Cpu size={20} color={colors.warning} />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.triggerMainTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.machineName}
                      </Text>
                      <Text style={[styles.triggerSubTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        Lini: {item.machineLine} • {item.machineType}
                      </Text>
                    </View>
                    <View style={[styles.triggerActionChip, { backgroundColor: colors.primary }]}>
                      <Text style={styles.triggerActionChipText}>Pilih Mesin</Text>
                    </View>
                  </Pressable>
                </View>

                {/* 3. PILIH MASTER PART (Trigger Card -> Modal 121 Master Part) */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                    2. PART NUMBER & NAMA PART * ({parts.length} MASTER PART TERSEDIA)
                  </Text>
                  <Pressable
                    onPress={() => handleOpenPartModal(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Pilih master part untuk item ${index + 1}`}
                    style={({ pressed }) => [
                      styles.selectorTriggerCard,
                      {
                        backgroundColor: colors.cardSubtle,
                        borderColor: colors.border,
                      },
                      pressed && { borderColor: colors.primary },
                    ]}
                  >
                    <View style={[styles.selectorIconCircle, { backgroundColor: colors.primary + '18' }]}>
                      <Package size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <View style={[styles.partNumberBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.partNumberBadgeText} numberOfLines={1}>{item.partNumber}</Text>
                        </View>
                      </View>
                      <Text style={[styles.triggerMainTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.partName}
                      </Text>
                      {item.partLine ? (
                        <Text style={[styles.triggerSubTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                          Lini: {item.partLine}
                        </Text>
                      ) : null}
                    </View>
                    <View style={[styles.triggerActionChip, { backgroundColor: colors.primary }]}>
                      <Text style={styles.triggerActionChipText}>Pilih Part</Text>
                    </View>
                  </Pressable>
                </View>

                {/* 3. PILIH PROSES OPERASIONAL MANUFAKTUR */}
                <View style={styles.fieldGroup}>
                  <View style={styles.processHeaderBar}>
                    <Text style={[styles.subFieldLabel, { color: colors.textSecondary, marginBottom: 0, flex: 1, marginRight: 8 }]} numberOfLines={1}>
                      3. PROSES OPERASIONAL *
                    </Text>
                    <View
                      style={[
                        styles.currentProcessBadge,
                        {
                          backgroundColor: item.isCustomProcess ? colors.warning + '18' : colors.primary + '18',
                          borderColor: item.isCustomProcess ? colors.warning : colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.currentProcessBadgeText,
                          { color: item.isCustomProcess ? colors.warning : colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.isCustomProcess && item.customProcess.trim()
                          ? `Kustom: ${item.customProcess.trim()}`
                          : item.processName}
                      </Text>
                    </View>
                  </View>

                  {/* Dynamic Quick-Picks (Auto-Adaptive per Lini Mesin) + Modal Trigger */}
                  <View style={styles.processChipsContainer}>
                    {quickPickProcesses.map((proc) => {
                      const isSelected = !item.isCustomProcess && item.processName === proc.name;
                      return (
                        <Pressable
                          key={proc.name}
                          onPress={() => {
                            updateItemField(item.id, 'isCustomProcess', false);
                            updateItemField(item.id, 'customProcess', '');
                            updateItemField(item.id, 'processName', proc.name);
                          }}
                          style={[
                            styles.processChipButton,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.cardSubtle,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          {isSelected && (
                            <Check size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                          )}
                          <Text
                            style={[
                              styles.processChipButtonText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}
                          >
                            {proc.name}
                          </Text>
                        </Pressable>
                      );
                    })}

                    {/* Jika sedang menggunakan proses kustom, tampilkan chip kustom aktif */}
                    {item.isCustomProcess && (
                      <View
                        style={[
                          styles.processChipButton,
                          {
                            backgroundColor: colors.warning,
                            borderColor: colors.warning,
                          },
                        ]}
                      >
                        <Check size={14} color="#000000" style={{ marginRight: 5 }} />
                        <Text
                          style={[
                            styles.processChipButtonText,
                            {
                              color: '#000000',
                              fontWeight: '800',
                            },
                          ]}
                        >
                          {item.customProcess.trim() || 'Kustom'}
                        </Text>
                      </View>
                    )}

                    {/* Tombol Praktis Buka Modal 16 Standar Proses & Opsi Kustom */}
                    <Pressable
                      onPress={() => handleOpenProcessModal(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Pilih proses lainnya untuk item ${index + 1}`}
                      style={[
                        styles.processChipButtonMore,
                        {
                          backgroundColor: colors.cardSubtle,
                          borderColor: colors.primary + '80',
                        },
                      ]}
                    >
                      <SlidersHorizontal size={13} color={colors.primary} style={{ marginRight: 5 }} />
                      <Text
                        style={[
                          styles.processChipButtonMoreText,
                          { color: colors.primary },
                        ]}
                      >
                        Semua & Kustom
                      </Text>
                    </Pressable>
                  </View>

                  {/* Input Cepat Proses Kustom jika mode kustom aktif */}
                  {item.isCustomProcess && (
                    <View style={styles.customProcessInputWrapper}>
                      <TextInput
                        value={item.customProcess}
                        onChangeText={(txt) => {
                          updateItemField(item.id, 'customProcess', txt);
                          updateItemField(item.id, 'processName', txt);
                        }}
                        placeholder="Ketik nama proses khusus (misal: Chamfering, Tap Ulir...)"
                        placeholderTextColor={colors.textMuted}
                        style={[
                          styles.customProcessInput,
                          {
                            backgroundColor: colors.cardSubtle,
                            borderColor: colors.warning,
                            color: colors.textPrimary,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 5. Target Produksi vs Hasil Aktual */}
                <View style={styles.doubleQtyRow}>
                  {/* Target Produksi */}
                  <View style={styles.qtyColumnItem}>
                    <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                      TARGET (PCS) *
                    </Text>
                    <View
                      style={[
                        styles.qtyInputBox,
                        { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                      ]}
                    >
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

                  {/* Hasil Aktual Mesin */}
                  <View style={styles.qtyColumnItem}>
                    <Text style={[styles.subFieldLabel, { color: colors.textSecondary }]}>
                      HASIL AKTUAL (PCS) *
                    </Text>
                    <View
                      style={[
                        styles.qtyInputBox,
                        { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                      ]}
                    >
                      <TextInput
                        value={String(item.producedQuantity)}
                        onChangeText={(txt) => {
                          const sanitized = txt.replace(/[^0-9]/g, '');
                          updateItemField(item.id, 'producedQuantity', sanitized);
                        }}
                        keyboardType="numeric"
                        placeholder="4000"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.bigNumericInput, { color: colors.primary }]}
                      />
                      <Text style={[styles.unitLabel, { color: colors.textMuted }]}>pcs</Text>
                    </View>
                  </View>
                </View>

                {/* 6. Live Achievement Card */}
                <AchievementMeter
                  target={Number(item.targetQuantity)}
                  actual={Number(item.producedQuantity)}
                />
              </View>
            );
          })}
        </View>

        {/* Tombol Simpan Produksi */}
        <View style={styles.saveContainer}>
          <SpringButton
            title="SIMPAN DATA PRODUKSI"
            variant="primary"
            size="large"
            loading={submitting}
            disabled={submitting}
            onPress={handlePressSubmit}
            style={styles.saveButton}
          />
          <Text style={[styles.saveFooterNotice, { color: colors.textMuted }]}>
            Data akan disinkronkan ke Supabase dan langsung memperbarui metrik Dashboard.
          </Text>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: SELECTOR MASTER PART (SELURUH 121 MASTER PART)                   */}
      {/* ========================================================================= */}
      <Modal
        visible={partModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPartModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={[styles.modalHeaderBadge, { backgroundColor: colors.primary + '18' }]}
                >
                  <Package size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                    PILIH MASTER PART
                  </Text>
                  <Text style={[styles.modalHeaderSubtitle, { color: colors.textSecondary }]}>
                    {parts.length} Part Tersedia di Database Plant
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setPartModalVisible(false)}
                hitSlop={12}
                style={[styles.modalCloseBtn, { backgroundColor: colors.cardSubtle }]}
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Currently Active Part Indicator */}
            {activeItemForPart && (
              <View
                style={[
                  styles.activeIndicatorBanner,
                  { backgroundColor: colors.primary + '12', borderColor: colors.primary + '40' },
                ]}
              >
                <CheckCircle2 size={16} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.activeIndicatorText, { color: colors.primary }]}>
                  Part Terpilih Saat Ini: {activeItemForPart.partNumber} - {activeItemForPart.partName}
                </Text>
              </View>
            )}

            {/* Search Bar */}
            <View
              style={[
                styles.modalSearchBar,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
              ]}
            >
              <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                value={partSearchQuery}
                onChangeText={setPartSearchQuery}
                placeholder="Cari part number (PT-1001) atau nama part..."
                placeholderTextColor={colors.textMuted}
                style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                autoCapitalize="characters"
              />
              {partSearchQuery.length > 0 && (
                <Pressable onPress={() => setPartSearchQuery('')} hitSlop={8}>
                  <X size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Line Filter Tabs */}
            <View style={styles.modalFilterRow}>
              {['Semua', 'Stamping', 'Welding'].map((filterName) => {
                const isActive = partLineFilter === filterName;
                return (
                  <Pressable
                    key={filterName}
                    onPress={() => setPartLineFilter(filterName)}
                    style={[
                      styles.modalFilterPill,
                      {
                        backgroundColor: isActive ? colors.primary : colors.cardSubtle,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalFilterPillText,
                        {
                          color: isActive ? '#FFFFFF' : colors.textSecondary,
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {filterName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* List of 121 Parts */}
            <FlatList
              data={modalFilteredParts}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.emptySearchContainer}>
                  <AlertCircle size={28} color={colors.textMuted} style={{ marginBottom: 6 }} />
                  <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                    Tidak ditemukan part sesuai kata kunci "{partSearchQuery}"
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = activeItemForPart && activeItemForPart.partId === item.id;
                return (
                  <Pressable
                    onPress={() => handleSelectPart(item)}
                    style={({ pressed }) => [
                      styles.partListItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.primary + '18' : 'transparent',
                      },
                      pressed && { backgroundColor: colors.cardSubtle },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={[
                            styles.itemPartNumberPill,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.cardSubtle,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.itemPartNumberText,
                              { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                            ]}
                          >
                            {item.partNumber}
                          </Text>
                        </View>
                        <Text style={[styles.itemPartLineTag, { color: colors.textMuted }]}>
                          Lini {item.line || 'Stamping'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.itemPartNameText,
                          { color: colors.textPrimary, marginTop: 4 },
                        ]}
                      >
                        {item.partName}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={20} color={colors.primary} style={{ marginLeft: 12 }} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: SELECTOR MESIN PRODUKSI (SELURUH 29 MESIN PABRIK)               */}
      {/* ========================================================================= */}
      <Modal
        visible={machineModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMachineModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={[styles.modalHeaderBadge, { backgroundColor: colors.warning + '18' }]}
                >
                  <Cpu size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                    PILIH MESIN PRODUKSI
                  </Text>
                  <Text style={[styles.modalHeaderSubtitle, { color: colors.textSecondary }]}>
                    {machines.length} Mesin Operasional PT Galaxy Mandiri Perkasa
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setMachineModalVisible(false)}
                hitSlop={12}
                style={[styles.modalCloseBtn, { backgroundColor: colors.cardSubtle }]}
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Currently Active Machine Indicator */}
            {activeItemForMachine && (
              <View
                style={[
                  styles.activeIndicatorBanner,
                  { backgroundColor: colors.warning + '12', borderColor: colors.warning + '40' },
                ]}
              >
                <CheckCircle2 size={16} color={colors.warning} style={{ marginRight: 8 }} />
                <Text style={[styles.activeIndicatorText, { color: colors.warning }]}>
                  Mesin Terpilih Saat Ini: {activeItemForMachine.machineName} ({activeItemForMachine.machineLine})
                </Text>
              </View>
            )}

            {/* Search Bar */}
            <View
              style={[
                styles.modalSearchBar,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
              ]}
            >
              <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                value={machineSearchQuery}
                onChangeText={setMachineSearchQuery}
                placeholder="Cari mesin (Amada, Komatsu, Robot, Spot...)"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalSearchInput, { color: colors.textPrimary }]}
              />
              {machineSearchQuery.length > 0 && (
                <Pressable onPress={() => setMachineSearchQuery('')} hitSlop={8}>
                  <X size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Line Filter Tabs for Machines */}
            <View style={styles.modalFilterWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalFilterScroll}
              >
                {machineLineTabs.map((tabItem) => {
                  const filterLine = tabItem.name;
                  const isActive = machineLineFilter === filterLine;
                  return (
                    <Pressable
                      key={filterLine}
                      onPress={() => setMachineLineFilter(filterLine)}
                      style={[
                        styles.modalFilterPill,
                        {
                          backgroundColor: isActive ? colors.warning : colors.cardSubtle,
                          borderColor: isActive ? colors.warning : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalFilterPillText,
                          {
                            color: isActive ? '#000000' : colors.textSecondary,
                            fontWeight: isActive ? '800' : '600',
                          },
                        ]}
                      >
                        {filterLine} ({tabItem.count})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* List of 29 Machines */}
            <FlatList
              data={modalFilteredMachines}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.emptySearchContainer}>
                  <AlertCircle size={28} color={colors.textMuted} style={{ marginBottom: 6 }} />
                  <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                    Tidak ditemukan mesin sesuai kata kunci "{machineSearchQuery}"
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSelected = activeItemForMachine && activeItemForMachine.machineName === item.name;
                return (
                  <Pressable
                    onPress={() => handleSelectMachine(item)}
                    style={({ pressed }) => [
                      styles.machineListItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.warning + '18' : 'transparent',
                      },
                      pressed && { backgroundColor: colors.cardSubtle },
                    ]}
                  >
                    <View
                      style={[
                        styles.machineTypeBadge,
                        {
                          backgroundColor:
                            item.line === 'Welding'
                              ? colors.critical + '18'
                              : item.line === 'Bending'
                              ? colors.warning + '18'
                              : colors.primary + '18',
                        },
                      ]}
                    >
                      <Factory
                        size={18}
                        color={
                          item.line === 'Welding'
                            ? colors.critical
                            : item.line === 'Bending'
                            ? colors.warning
                            : colors.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.machineListName, { color: colors.textPrimary }]}>
                          {item.name}
                        </Text>
                        <View style={[styles.lineBadgeTag, { backgroundColor: colors.cardSubtle }]}>
                          <Text style={[styles.lineBadgeTagText, { color: colors.textSecondary }]}>
                            {item.line}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.machineListType, { color: colors.textMuted }]}>
                        {item.type || 'Peralatan Pabrik'}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={20} color={colors.warning} style={{ marginLeft: 12 }} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: SELECTOR PROSES OPERASIONAL (16 STANDAR & KUSTOM)                */}
      {/* ========================================================================= */}
      <Modal
        visible={processModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProcessModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}>
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={[styles.modalHeaderBadge, { backgroundColor: colors.primary + '18' }]}
                >
                  <Layers size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                    PILIH PROSES OPERASIONAL
                  </Text>
                  <Text style={[styles.modalHeaderSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    16 Standar Manufaktur & Opsi Kustom
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setProcessModalVisible(false)}
                hitSlop={12}
                style={[styles.modalCloseBtn, { backgroundColor: colors.cardSubtle }]}
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Currently Active Process Indicator */}
            {activeItemForProcess && (
              <View
                style={[
                  styles.activeIndicatorBanner,
                  {
                    backgroundColor: activeItemForProcess.isCustomProcess ? colors.warning + '12' : colors.primary + '12',
                    borderColor: activeItemForProcess.isCustomProcess ? colors.warning + '40' : colors.primary + '40',
                  },
                ]}
              >
                <CheckCircle2
                  size={16}
                  color={activeItemForProcess.isCustomProcess ? colors.warning : colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.activeIndicatorText,
                    { color: activeItemForProcess.isCustomProcess ? colors.warning : colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  Proses Saat Ini: {activeItemForProcess.isCustomProcess && activeItemForProcess.customProcess.trim()
                    ? `Kustom: ${activeItemForProcess.customProcess.trim()}`
                    : activeItemForProcess.processName}
                </Text>
              </View>
            )}

            {/* Custom Process Box */}
            <View style={[styles.modalCustomCard, { backgroundColor: colors.cardSubtle, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Sparkles size={14} color={colors.warning} style={{ marginRight: 6 }} />
                <Text style={[styles.modalCustomCardTitle, { color: colors.textPrimary }]}>
                  Gunakan Proses Khusus / Kustom:
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  value={customProcessTemp}
                  onChangeText={setCustomProcessTemp}
                  placeholder="Ketik nama proses khusus (mis: Chamfering...)"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalCustomInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textPrimary, flex: 1 }]}
                />
                <Pressable
                  onPress={() => handleApplyCustomProcess(customProcessTemp)}
                  disabled={!customProcessTemp.trim()}
                  style={[
                    styles.modalCustomApplyBtn,
                    {
                      backgroundColor: customProcessTemp.trim() ? colors.warning : colors.cardSubtle,
                      opacity: customProcessTemp.trim() ? 1 : 0.5,
                    },
                  ]}
                >
                  <Text style={[styles.modalCustomApplyBtnText, { color: customProcessTemp.trim() ? '#000000' : colors.textMuted }]}>
                    Terapkan
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.modalSearchBar,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
              ]}
            >
              <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                value={processSearchQuery}
                onChangeText={setProcessSearchQuery}
                placeholder="Cari proses standar (Blanking, Spot, ED Coating...)"
                placeholderTextColor={colors.textMuted}
                style={[styles.modalSearchInput, { color: colors.textPrimary }]}
              />
              {processSearchQuery.length > 0 && (
                <Pressable onPress={() => setProcessSearchQuery('')} hitSlop={8}>
                  <X size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Category Filter Tabs */}
            <View style={styles.modalFilterWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalFilterScroll}
              >
                {processCategoryTabs.map((tabItem) => {
                  const filterCat = tabItem.name;
                  const isActive = processCategoryFilter === filterCat;
                  return (
                    <Pressable
                      key={filterCat}
                      onPress={() => setProcessCategoryFilter(filterCat)}
                      style={[
                        styles.modalFilterPill,
                        {
                          backgroundColor: isActive ? colors.primary : colors.cardSubtle,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalFilterPillText,
                          {
                            color: isActive ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: isActive ? '800' : '600',
                          },
                        ]}
                      >
                        {filterCat} ({tabItem.count})
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* List of 16 Standard Processes */}
            <FlatList
              data={modalFilteredProcesses}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.emptySearchContainer}>
                  <AlertCircle size={28} color={colors.textMuted} style={{ marginBottom: 6 }} />
                  <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>
                    Tidak ditemukan proses sesuai kata kunci "{processSearchQuery}"
                  </Text>
                </View>
              }
              renderItem={({ item: proc }) => {
                const isSelected = activeItemForProcess && !activeItemForProcess.isCustomProcess && activeItemForProcess.processName === proc.name;
                return (
                  <Pressable
                    onPress={() => handleSelectProcess(proc)}
                    style={({ pressed }) => [
                      styles.partListItem,
                      {
                        borderBottomColor: colors.border,
                        backgroundColor: isSelected ? colors.primary + '18' : 'transparent',
                      },
                      pressed && { backgroundColor: colors.cardSubtle },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.machineListName, { color: colors.textPrimary, marginRight: 8 }]}>
                          {proc.name}
                        </Text>
                        <View
                          style={[
                            styles.processCategoryBadge,
                            {
                              backgroundColor:
                                proc.category === 'Welding'
                                  ? colors.critical + '18'
                                  : proc.category.includes('Finishing')
                                  ? colors.warning + '18'
                                  : colors.primary + '18',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.processCategoryBadgeText,
                              {
                                color:
                                  proc.category === 'Welding'
                                    ? colors.critical
                                    : proc.category.includes('Finishing')
                                    ? colors.warning
                                    : colors.primary,
                              },
                            ]}
                          >
                            {proc.category}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.machineListSubtitle, { color: colors.textSecondary, marginTop: 4 }]}>
                        {proc.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={20} color={colors.primary} style={{ marginLeft: 12 }} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL KONFIRMASI INPUT DATA PRODUKSI */}
      <ConfirmProductionModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
        data={{
          productionDate,
          selectedShift,
          operatorName: user?.fullName || user?.username || 'Operator',
          items,
        }}
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
    paddingTop: 12,
    paddingBottom: 64,
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
  sectionHint: {
    fontSize: typography.sizes.caption - 1,
    marginTop: 2,
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
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
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
    marginBottom: 16,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  itemIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  indexNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  itemIndexTitle: {
    fontSize: typography.sizes.body + 1,
    fontWeight: '800',
  },
  itemIndexSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 1,
  },
  deleteItemBtn: {
    padding: 8,
    borderRadius: 8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  subFieldLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  selectorTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 56,
  },
  selectorIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  triggerMainTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '800',
  },
  triggerSubTitle: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  triggerActionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  triggerActionChipText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  partNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  partNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  partLineText: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  processHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentProcessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '55%',
  },
  currentProcessBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  processChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  processChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 38,
  },
  processChipButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
  processChipButtonMore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 38,
  },
  processChipButtonMoreText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  customProcessInputWrapper: {
    marginTop: 10,
  },
  customProcessInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
  modalCustomCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalCustomCardTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  modalCustomInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: typography.sizes.caption,
    fontWeight: '600',
  },
  modalCustomApplyBtn: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCustomApplyBtnText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  processCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  processCategoryBadgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  doubleQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 12,
  },
  qtyColumnItem: {
    flex: 1,
  },
  qtyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  bigNumericInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  unitLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    marginLeft: 4,
  },
  saveContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  saveButton: {
    width: '100%',
    minHeight: 52,
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
  // Modal Sheet Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '85%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 6,
  },
  modalHeaderBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  modalHeaderTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  modalHeaderSubtitle: {
    fontSize: typography.sizes.caption,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicatorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  activeIndicatorText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
    flex: 1,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
  modalFilterWrapper: {
    height: 44,
    marginBottom: 10,
    flexShrink: 0,
    justifyContent: 'center',
  },
  modalFilterRow: {
    flexDirection: 'row',
    height: 44,
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexShrink: 0,
  },
  modalFilterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 8,
  },
  modalFilterPill: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalFilterPillText: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
  },
  emptySearchContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  emptySearchText: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
  },
  partListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  itemPartNumberPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  itemPartNumberText: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
  },
  itemPartLineTag: {
    fontSize: typography.sizes.micro,
    fontWeight: '600',
  },
  itemPartNameText: {
    fontSize: typography.sizes.body,
    fontWeight: '700',
  },
  machineListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  machineTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  machineListName: {
    fontSize: typography.sizes.body,
    fontWeight: '800',
    marginRight: 8,
  },
  lineBadgeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineBadgeTagText: {
    fontSize: typography.sizes.micro - 1,
    fontWeight: '700',
  },
  machineListType: {
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
});

export default InputProductionScreen;
