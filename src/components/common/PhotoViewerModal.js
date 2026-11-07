import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Share2,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  Maximize2,
  Minimize2,
  Calendar,
  User,
  ShieldCheck,
  Factory,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getBaseUrl } from '../../api/endpoints';
import { typography } from '../../theme/typography';
import { formatIndonesianDate } from '../../utils/dateFormatter';

/**
 * Helper untuk mengubah filename, path relatif, atau URI lokal menjadi URL gambar yang valid
 */
export const resolvePhotoUri = (uri) => {
  if (!uri) return null;
  const trimmed = String(uri).trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const baseUrl = getBaseUrl();
  const serverRoot = baseUrl.replace(/\/api\/?$/, '');
  const cleanFilename = trimmed.replace(/^\/+/, '').replace(/^uploads\//i, '');
  return `${serverRoot}/api/upload/${cleanFilename}`;
};

/**
 * PhotoViewerModal: Dialog Preview Bukti Foto Cacat yang Praktis, Bersih & Dinamis
 * Selaras dengan sistem desain kartu aplikasi (mendukung Light & Dark mode).
 */
export const PhotoViewerModal = ({
  visible = false,
  onClose,
  item = null,
  token = null,
}) => {
  const { colors, isDark } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Ekstraksi properti dari item secara aman
  const isItemObject = Boolean(item && typeof item === 'object');
  const rawUri = isItemObject ? (item.photoUrl || item.uri) : item;
  const defectName = String(isItemObject ? (item.defectName || 'Temuan Cacat') : 'Bukti Foto');
  const quantity = isItemObject && item.quantity ? Number(item.quantity) : null;
  const partNumber = isItemObject && item.partNumber ? String(item.partNumber) : null;
  const partName = isItemObject && item.partName ? String(item.partName) : null;
  const machineName = isItemObject && item.namaMesin ? String(item.namaMesin) : null;
  const processName = isItemObject && item.proses ? String(item.proses) : null;
  const shift = isItemObject && item.shift ? String(item.shift) : null;
  const operatorName = isItemObject && item.operatorName ? String(item.operatorName) : null;
  const qcInspector = isItemObject && (item.createdBy || item.username) ? String(item.createdBy || item.username) : null;
  const defectDate = isItemObject && item.defectDate ? String(item.defectDate) : null;
  const time = isItemObject && item.time ? String(item.time) : null;
  const remarks = isItemObject && item.remarks ? String(item.remarks).trim() : '';
  const isOffline = Boolean(isItemObject && item.isOffline);

  // State interaksi
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [isFullscreenPhoto, setIsFullscreenPhoto] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Reset state saat modal dibuka atau item berganti
  useEffect(() => {
    if (visible) {
      setZoomLevel(1.0);
      setRotationDegree(0);
      setIsFullscreenPhoto(false);
      setImageError(false);
      setImageLoading(true);
    }
  }, [visible, rawUri]);

  const finalUri = useMemo(() => {
    if (!rawUri) return null;
    const resolved = resolvePhotoUri(rawUri);
    if (!resolved) return null;
    if (retryKey > 0 && (resolved.startsWith('http://') || resolved.startsWith('https://'))) {
      const sep = resolved.includes('?') ? '&' : '?';
      return `${resolved}${sep}_t=${retryKey}`;
    }
    return resolved;
  }, [rawUri, retryKey]);

  const imageSource = useMemo(() => {
    if (!finalUri) return null;
    const isHttp = finalUri.startsWith('http://') || finalUri.startsWith('https://');
    if (isHttp && token) {
      return { uri: finalUri, headers: { Authorization: `Bearer ${token}` } };
    }
    return { uri: finalUri };
  }, [finalUri, token]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      if (prev < 1.4) return 1.5;
      if (prev < 1.9) return 2.0;
      return 3.0;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      if (prev > 2.2) return 2.0;
      if (prev > 1.4) return 1.5;
      return 1.0;
    });
  };

  const handleRotate = () => {
    setRotationDegree((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1.0);
    setRotationDegree(0);
  };

  const handleRetryLoad = () => {
    setImageError(false);
    setImageLoading(true);
    setRetryKey(Date.now());
  };

  const handleShare = async () => {
    try {
      const formattedDate = defectDate ? formatIndonesianDate(defectDate) : 'Hari Ini';
      const msg = [
        `*BUKTI TEMUAN CACAT QC*`,
        `Cacat       : ${defectName}${quantity ? ` (${quantity} pcs NG)` : ''}`,
        partNumber ? `Part        : ${partNumber}${partName ? ` - ${partName}` : ''}` : null,
        machineName ? `Mesin/Proses: ${machineName}${processName ? ` (${processName})` : ''}` : null,
        shift ? `Shift       : ${shift}` : null,
        `Waktu       : ${formattedDate}${time ? ` • ${time} WIB` : ''}`,
        operatorName ? `Operator    : ${operatorName}` : null,
        qcInspector ? `Petugas QC  : ${qcInspector}` : null,
        remarks ? `Catatan     : "${remarks}"` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Gagal membagikan bukti foto:', e);
    }
  };

  if (!visible) return null;

  // Perhitungan ukuran proporsional untuk ponsel dan tablet
  const isTablet = screenWidth >= 600;
  const maxDialogWidth = isTablet ? Math.min(screenWidth - 48, 560) : screenWidth - 28;
  const photoBoxWidth = maxDialogWidth - 28; // dikurangi padding kartu (14 * 2)
  const photoBoxHeight = isFullscreenPhoto
    ? Math.max(320, screenHeight * 0.64)
    : isTablet
      ? Math.min(380, screenHeight * 0.42)
      : Math.min(280, screenHeight * 0.36);

  const isModified = zoomLevel !== 1.0 || rotationDegree !== 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(2, 6, 23, 0.78)' }]}>
        {/* Klik area gelap di luar kartu untuk menutup */}
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        {/* Kartu Modal Utama */}
        <View
          style={[
            styles.dialogCard,
            {
              width: maxDialogWidth,
              maxHeight: screenHeight * 0.9,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* ========================================================= */}
          {/* 1. HEADER MODAL: MESIN, PROSES, SHIFT & TOMBOL TUTUP      */}
          {/* ========================================================= */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.machineIconBox, { backgroundColor: colors.primary + '16' }]}>
                <Factory size={16} color={colors.primary} />
              </View>
              <View style={styles.headerTitleCol}>
                <View style={styles.headerTopBadges}>
                  <Text style={[styles.machineTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                    {machineName || 'Lini Produksi'}
                  </Text>
                  {processName ? (
                    <View style={[styles.smallTag, { backgroundColor: colors.primary + '16' }]}>
                      <Text style={[styles.smallTagText, { color: colors.primary }]}>{processName}</Text>
                    </View>
                  ) : null}
                  {shift ? (
                    <View style={[styles.smallTag, { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderWidth: 1 }]}>
                      <Text style={[styles.smallTagText, { color: colors.textSecondary }]}>{shift}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {defectDate ? formatIndonesianDate(defectDate) : 'Hari Ini'}
                  {time ? ` • ${time} WIB` : ''}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed ? { opacity: 0.7 } : null,
              ]}
            >
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.cardScrollBody}
          >
            {/* ========================================================= */}
            {/* 2. AREA FOTO BUKTI & KONTROL INTERAKTIF                   */}
            {/* ========================================================= */}
            <View
              style={[
                styles.photoContainer,
                {
                  height: photoBoxHeight,
                  backgroundColor: isDark ? '#090D16' : '#0F172A',
                  borderColor: colors.border,
                },
              ]}
            >
              {imageError ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={32} color="#F59E0B" style={{ marginBottom: 8 }} />
                  <Text style={styles.errorTitle}>Foto Gagal Dimuat</Text>
                  <Text style={styles.errorDesc}>
                    File bukti foto tidak ditemukan di server atau koneksi terputus.
                  </Text>
                  <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={handleRetryLoad}>
                    <RotateCcw size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.retryBtnText}>Muat Ulang</Text>
                  </Pressable>
                </View>
              ) : imageSource ? (
                zoomLevel > 1.0 ? (
                  <ScrollView
                    style={{ width: photoBoxWidth, height: photoBoxHeight }}
                    contentContainerStyle={styles.photoScrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    showsHorizontalScrollIndicator={false}
                  >
                    <ScrollView
                      horizontal
                      nestedScrollEnabled
                      contentContainerStyle={styles.photoScrollContent}
                      showsHorizontalScrollIndicator
                    >
                      <Image
                        key={`${finalUri}_${retryKey}`}
                        source={imageSource}
                        style={{
                          width: photoBoxWidth * zoomLevel,
                          height: photoBoxHeight * zoomLevel,
                          transform: [{ rotate: `${rotationDegree}deg` }],
                        }}
                        resizeMode="contain"
                        onLoadStart={() => setImageLoading(true)}
                        onLoad={() => setImageLoading(false)}
                        onLoadEnd={() => setImageLoading(false)}
                        onError={() => {
                          setImageLoading(false);
                          setImageError(true);
                        }}
                      />
                    </ScrollView>
                  </ScrollView>
                ) : (
                  <Image
                    key={`${finalUri}_${retryKey}`}
                    source={imageSource}
                    style={{
                      width: photoBoxWidth,
                      height: photoBoxHeight,
                      transform: [{ rotate: `${rotationDegree}deg` }],
                    }}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoading(true)}
                    onLoad={() => setImageLoading(false)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                )
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorDesc}>Tidak ada lampiran foto</Text>
                </View>
              )}

              {/* Indikator Loading di atas gambar (tanpa menyembunyikan gambar dengan opacity 0) */}
              {imageLoading && !imageError ? (
                <View style={styles.loadingOverlay} pointerEvents="none">
                  <ActivityIndicator size="large" color="#38BDF8" />
                </View>
              ) : null}
            </View>

            {/* Control Bar Foto (Menyatu Rapi di Bawah Frame Foto) */}
            {!imageError && finalUri ? (
              <View
                style={[
                  styles.photoToolbar,
                  { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                ]}
              >
                {/* Kontrol Zoom */}
                <View style={styles.toolbarGroup}>
                  <Pressable
                    onPress={handleZoomOut}
                    disabled={zoomLevel <= 1.0}
                    hitSlop={6}
                    style={[
                      styles.toolBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      zoomLevel <= 1.0 ? { opacity: 0.4 } : null,
                    ]}
                  >
                    <ZoomOut size={15} color={colors.textPrimary} />
                  </Pressable>

                  <Pressable
                    onPress={handleReset}
                    style={[styles.zoomIndicator, { backgroundColor: colors.primary + '16' }]}
                  >
                    <Text style={[styles.zoomIndicatorText, { color: colors.primary }]}>
                      {Math.round(zoomLevel * 100)}%
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleZoomIn}
                    disabled={zoomLevel >= 3.0}
                    hitSlop={6}
                    style={[
                      styles.toolBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      zoomLevel >= 3.0 ? { opacity: 0.4 } : null,
                    ]}
                  >
                    <ZoomIn size={15} color={colors.textPrimary} />
                  </Pressable>
                </View>

                {/* Kontrol Rotasi, Reset & Ukuran */}
                <View style={styles.toolbarGroup}>
                  <Pressable
                    onPress={handleRotate}
                    hitSlop={6}
                    style={[styles.toolBtnWithText, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <RotateCw size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
                    <Text style={[styles.toolBtnLabel, { color: colors.textPrimary }]}>
                      {rotationDegree > 0 ? `${rotationDegree}°` : 'Putar'}
                    </Text>
                  </Pressable>

                  {isModified ? (
                    <Pressable
                      onPress={handleReset}
                      hitSlop={6}
                      style={[styles.toolBtn, { backgroundColor: colors.warning + '20', borderColor: colors.warning + '50' }]}
                    >
                      <RotateCcw size={14} color={colors.warning} />
                    </Pressable>
                  ) : null}

                  <Pressable
                    onPress={() => setIsFullscreenPhoto((prev) => !prev)}
                    hitSlop={6}
                    style={[
                      styles.toolBtnWithText,
                      {
                        backgroundColor: isFullscreenPhoto ? colors.primary : colors.card,
                        borderColor: isFullscreenPhoto ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isFullscreenPhoto ? (
                      <Minimize2 size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                    ) : (
                      <Maximize2 size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
                    )}
                    <Text
                      style={[
                        styles.toolBtnLabel,
                        { color: isFullscreenPhoto ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {isFullscreenPhoto ? 'Ringkas' : 'Perbesar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/* ========================================================= */}
            {/* 3. RINGKASAN DATA INSPEKSI (JELAS & TANPA TERPOTONG)      */}
            {/* ========================================================= */}
            {!isFullscreenPhoto ? (
              <View style={styles.infoSection}>
                {/* Kotak Part & Jenis Cacat */}
                <View
                  style={[
                    styles.defectSummaryCard,
                    {
                      backgroundColor: colors.critical + '0C',
                      borderColor: colors.critical + '30',
                    },
                  ]}
                >
                  <View style={styles.defectSummaryLeft}>
                    {partNumber ? (
                      <Text style={[styles.partNumberLabel, { color: colors.primary }]}>
                        {partNumber}
                      </Text>
                    ) : null}
                    <Text style={[styles.partNameTitle, { color: colors.textPrimary }]}>
                      {partName || 'Part Komponen'}
                    </Text>
                    <View style={styles.defectTypeRow}>
                      <AlertTriangle size={14} color={colors.critical} style={{ marginRight: 5 }} />
                      <Text style={[styles.defectNameTitle, { color: colors.critical }]}>
                        Cacat: {defectName}
                      </Text>
                    </View>
                  </View>

                  {quantity ? (
                    <View
                      style={[
                        styles.qtyBox,
                        { backgroundColor: colors.critical + '18', borderColor: colors.critical + '40' },
                      ]}
                    >
                      <Text style={[styles.qtyNumber, { color: colors.critical }]}>
                        {quantity.toLocaleString('id-ID')}
                      </Text>
                      <Text style={[styles.qtyUnit, { color: colors.critical }]}>pcs NG</Text>
                    </View>
                  ) : null}
                </View>

                {/* Detail Personel & Status Sinkronisasi (Vertikal Jelas, Bebas Truncation) */}
                <View
                  style={[
                    styles.detailsListBox,
                    { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelWrap}>
                      <User size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Operator</Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {operatorName || '-'}
                    </Text>
                  </View>

                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelWrap}>
                      <ShieldCheck size={13} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Petugas QC</Text>
                    </View>
                    <View style={styles.qcRightGroup}>
                      <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
                        {qcInspector || '-'}
                      </Text>
                      <View
                        style={[
                          styles.syncPill,
                          {
                            backgroundColor: isOffline ? colors.warning + '18' : colors.success + '18',
                          },
                        ]}
                      >
                        {isOffline ? (
                          <WifiOff size={10} color={colors.warning} style={{ marginRight: 3 }} />
                        ) : (
                          <CheckCircle2 size={10} color={colors.success} style={{ marginRight: 3 }} />
                        )}
                        <Text
                          style={[
                            styles.syncPillText,
                            { color: isOffline ? colors.warning : colors.success },
                          ]}
                        >
                          {isOffline ? 'Lokal' : 'Cloud'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {remarks ? (
                    <View>
                      <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                      <View style={styles.remarksRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 2 }]}>
                          Catatan Inspeksi:
                        </Text>
                        <Text style={[styles.remarksValue, { color: colors.textPrimary }]}>
                          "{remarks}"
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* ========================================================= */}
          {/* 4. FOOTER TOMBOL AKSI                                     */}
          {/* ========================================================= */}
          <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.shareBtn,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed ? { opacity: 0.75 } : null,
              ]}
            >
              <Share2 size={15} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.shareBtnText, { color: colors.textPrimary }]}>Bagikan</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.doneBtn,
                { backgroundColor: colors.primary },
                pressed ? { opacity: 0.85 } : null,
              ]}
            >
              <Text style={styles.doneBtnText}>Tutup Preview</Text>
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
    padding: 14,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // 1. HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  machineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTopBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  machineTitleText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  smallTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  smallTagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: typography.fontFamily,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // BODY
  cardScrollBody: {
    padding: 14,
  },

  // 2. PHOTO VIEWPORT
  photoContainer: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoScrollVertical: {
    flex: 1,
    width: '100%',
  },
  photoScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  errorBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: typography.fontFamily,
  },
  errorDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: typography.fontFamily,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },

  // PHOTO TOOLBAR
  photoToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnWithText: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  zoomIndicator: {
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  zoomIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },

  // 3. INFO SECTION
  infoSection: {
    marginTop: 12,
    gap: 10,
  },
  defectSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  defectSummaryLeft: {
    flex: 1,
    marginRight: 10,
  },
  partNumberLabel: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  partNameTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
    fontFamily: typography.fontFamily,
  },
  defectTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  defectNameTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
  qtyBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
  },
  qtyNumber: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: typography.fontFamily,
  },
  qtyUnit: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },

  // DETAILS LIST
  detailsListBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
    fontFamily: typography.fontFamily,
  },
  qcRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  syncPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  detailDivider: {
    height: 1,
    width: '100%',
    marginVertical: 2,
  },
  remarksRow: {
    paddingVertical: 5,
  },
  remarksValue: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    fontFamily: typography.fontFamily,
  },

  // 4. FOOTER
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.fontFamily,
  },
  doneBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },
});
