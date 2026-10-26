import React from 'react';
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
  AlertTriangle,
  AlertCircle,
  WifiOff,
  ServerCrash,
  Lock,
  UserX,
  ShieldAlert,
  X,
  CheckCircle2,
  ChevronRight,
  Eye,
  RefreshCw,
  HelpCircle,
  Network,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

/**
 * LoginErrorModal: Pop-up Modal Khusus Error Login Handheld QC
 * Menangani error: Jaringan, Salah Password, User Tidak Ditemukan, Akun Dinonaktifkan, Validasi Input, dll.
 */
export const LoginErrorModal = ({
  visible,
  onClose,
  errorData = null,
  onShowPassword = null,
  onRetry = null,
}) => {
  const { colors, isDark } = useTheme();

  if (!errorData) return null;

  const {
    type = 'GENERAL',
    title: customTitle,
    message: customMessage,
    host = '',
    username = '',
    status = null,
  } = errorData;

  // Konfigurasi dinamis berdasarkan jenis error
  const getConfig = () => {
    switch (type) {
      case 'NETWORK':
        return {
          badge: 'MASALAH KONEKSI / JARINGAN',
          badgeColor: colors.critical,
          IconComponent: WifiOff,
          iconColor: colors.critical,
          title: customTitle || 'Gagal Menghubungi Server',
          subtitle: 'Aplikasi tidak dapat terhubung ke server database backend pabrik.',
          detailLabel: 'Target Server',
          detailValue: host ? `http://${host}:8080/api` : 'Server Backend Spring Boot',
          tips: [
            'Pastikan perangkat terhubung ke Wi-Fi pabrik (jaringan lokal yang sama dengan server).',
            'Pastikan backend Spring Boot (port 8080) sudah dijalankan di komputer host.',
            'Periksa apakah IP server backend berubah di jaringan lokal.',
          ],
          primaryActionText: 'Coba Hubungkan Lagi',
          showRetryAction: true,
        };

      case 'TIMEOUT':
        return {
          badge: 'WAKTU SAMBUNGAN HABIS',
          badgeColor: colors.warning,
          IconComponent: AlertTriangle,
          iconColor: colors.warning,
          title: customTitle || 'Waktu Tunggu Habis (Timeout)',
          subtitle: 'Server membutuhkan waktu lebih dari 10 detik untuk merespons.',
          detailLabel: 'Status Sambungan',
          detailValue: 'Request Timeout (10000ms)',
          tips: [
            'Koneksi Wi-Fi sedang tidak stabil atau mengalami interferensi sinyal.',
            'Beban proses di server database sedang tinggi, silakan coba sesaat lagi.',
          ],
          primaryActionText: 'Coba Lagi',
          showRetryAction: true,
        };

      case 'WRONG_CREDENTIALS':
        return {
          badge: 'KREDENSIAL TIDAK SESUAI',
          badgeColor: colors.critical,
          IconComponent: Lock,
          iconColor: colors.critical,
          title: customTitle || 'Username atau Kata Sandi Salah',
          subtitle: 'Kombinasi nama pengguna dan kata sandi tidak cocok di database.',
          detailLabel: 'Username Dicoba',
          detailValue: username ? `@${username}` : 'Operator Terkait',
          tips: [
            'Periksa apakah tombol Caps Lock pada keyboard aktif (kata sandi bersifat case-sensitive).',
            'Gunakan tombol "Periksa Ejaan Sandi" di bawah untuk melihat teks kata sandi yang Anda ketik.',
            'Pastikan username operator diketik dengan benar tanpa spasi.',
            'Jika Anda lupa kata sandi, hubungi Supervisor QC atau Administrator Pabrik.',
          ],
          primaryActionText: 'Periksa Ejaan Sandi',
          secondaryActionText: 'Coba Lagi',
          canRevealPassword: true,
        };

      case 'USER_NOT_FOUND':
        return {
          badge: 'AKUN TIDAK DITEMUKAN',
          badgeColor: '#F59E0B',
          IconComponent: UserX,
          iconColor: '#F59E0B',
          title: customTitle || 'Operator Tidak Terdaftar',
          subtitle: `Username "${username || 'tersebut'}" tidak ditemukan dalam daftar operator resmi pabrik.`,
          detailLabel: 'Pencarian Database',
          detailValue: username ? `User "${username}" tidak ada` : 'Data user kosong',
          tips: [
            'Periksa kemungkinan salah ketik pada kolom Username.',
            'Pastikan Anda menggunakan username operator yang terdaftar di PT Galaxy Mandiri Perkasa.',
            'Jika Anda karyawan baru, minta Admin QC untuk mendaftarkan akun Anda.',
          ],
          primaryActionText: 'Perbaiki Username',
        };

      case 'FORBIDDEN':
        return {
          badge: 'AKSES DITOLAK (403)',
          badgeColor: colors.critical,
          IconComponent: ShieldAlert,
          iconColor: colors.critical,
          title: customTitle || 'Akses Masuk Ditolak',
          subtitle: 'Akun Anda saat ini tidak memiliki otorisasi untuk mengakses aplikasi handheld.',
          detailLabel: 'Status Otorisasi',
          detailValue: 'Akses dibatasi oleh Administrator',
          tips: [
            'Akun operator Anda mungkin sedang dinonaktifkan sementara.',
            'Role akun Anda mungkin belum disetel untuk OPERATOR_PRODUKSI atau ADMIN.',
            'Segera laporkan hal ini kepada Supervisor Bagian QC atau IT Support.',
          ],
          primaryActionText: 'Saya Mengerti',
        };

      case 'EMPTY_USERNAME':
        return {
          badge: 'VALIDASI FORM LOGIN',
          badgeColor: colors.warning,
          IconComponent: AlertCircle,
          iconColor: colors.warning,
          title: customTitle || 'Username Belum Diisi',
          subtitle: 'Kolom Username Operator wajib diisi sebelum dapat masuk ke sistem.',
          detailLabel: 'Data Kurang',
          detailValue: 'Username Kosong',
          tips: [
            'Masukkan username akun Anda yang telah terdaftar pada database sistem.',
          ],
          primaryActionText: 'Ketik Username Sekarang',
        };

      case 'EMPTY_PASSWORD':
        return {
          badge: 'VALIDASI FORM LOGIN',
          badgeColor: colors.warning,
          IconComponent: AlertCircle,
          iconColor: colors.warning,
          title: customTitle || 'Kata Sandi Belum Diisi',
          subtitle: 'Kolom Kata Sandi wajib diisi demi keamanan akses terminal produksi.',
          detailLabel: 'Data Kurang',
          detailValue: 'Kata Sandi Kosong',
          tips: [
            'Ketik kata sandi akun operator Anda pada kolom sandi.',
            'Gunakan tombol mata jika ingin memastikan karakter yang diketik.',
          ],
          primaryActionText: 'Ketik Kata Sandi Sekarang',
        };

      case 'EMPTY_FIELDS':
        return {
          badge: 'VALIDASI FORM LOGIN',
          badgeColor: colors.warning,
          IconComponent: AlertCircle,
          iconColor: colors.warning,
          title: customTitle || 'Kredensial Belum Lengkap',
          subtitle: 'Harap lengkapi kolom Username dan Kata Sandi operator.',
          detailLabel: 'Status Form',
          detailValue: 'Kedua kolom masih kosong',
          tips: [
            'Masukkan Username dan Kata Sandi yang valid untuk masuk ke sistem.',
          ],
          primaryActionText: 'Lengkapi Data Form',
        };

      case 'SERVER_ERROR':
        return {
          badge: `SERVER ERROR (${status || 500})`,
          badgeColor: colors.critical,
          IconComponent: ServerCrash,
          iconColor: colors.critical,
          title: customTitle || 'Gangguan Server Database',
          subtitle: 'Server backend mengalami kendala internal saat memproses autentikasi.',
          detailLabel: 'Respon Backend',
          detailValue: `HTTP Status ${status || 500} Internal Error`,
          tips: [
            'Tunggu 1-2 menit lalu coba masuk kembali.',
            'Jika kendala berlanjut, hubungi tim IT / Database Administrator untuk memeriksa log server.',
          ],
          primaryActionText: 'Coba Lagi Nanti',
          showRetryAction: true,
        };

      default:
        return {
          badge: 'KESALAHAN SISTEM',
          badgeColor: colors.critical,
          IconComponent: AlertTriangle,
          iconColor: colors.critical,
          title: customTitle || 'Gagal Melakukan Login',
          subtitle: customMessage || 'Sistem tidak dapat memproses permintaan masuk Anda saat ini.',
          detailLabel: 'Detail Error',
          detailValue: customMessage || 'Kesalahan tidak terduga',
          tips: [
            'Periksa kembali data akun Anda.',
            'Pastikan koneksi internet atau Wi-Fi pabrik aktif.',
            'Coba restart aplikasi jika masalah terus berlanjut.',
          ],
          primaryActionText: 'Tutup & Coba Lagi',
        };
    }
  };

  const config = getConfig();
  const {
    badge,
    badgeColor,
    IconComponent,
    iconColor,
    title,
    subtitle,
    detailLabel,
    detailValue,
    tips,
    primaryActionText,
    secondaryActionText,
    canRevealPassword,
    showRetryAction,
  } = config;

  const handlePrimaryPress = () => {
    if (canRevealPassword && onShowPassword) {
      onShowPassword();
      onClose();
    } else if (showRetryAction && onRetry) {
      onClose();
      setTimeout(() => {
        onRetry();
      }, 250);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.backdrop }]}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />

        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Top Bar with Badge & Close Button */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.badgeContainer,
                {
                  backgroundColor: badgeColor + '18',
                  borderColor: badgeColor + '40',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {badge}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Main Icon & Title Header */}
            <View style={styles.headerSection}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: iconColor + '18',
                    borderColor: iconColor + '44',
                  },
                ]}
              >
                <IconComponent size={32} color={iconColor} strokeWidth={2.3} />
              </View>

              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            </View>

            {/* Error Message & Context Box */}
            <View
              style={[
                styles.contextBox,
                {
                  backgroundColor: colors.cardSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.contextHeaderRow}>
                <Text style={[styles.contextLabel, { color: colors.textMuted }]}>
                  {detailLabel || 'Keterangan Sistem'}
                </Text>
                <Text
                  style={[styles.contextValue, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {detailValue}
                </Text>
              </View>

              {customMessage && customMessage !== subtitle && (
                <View
                  style={[
                    styles.rawMessageBox,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.rawMessageText, { color: colors.textSecondary }]}>
                    "{customMessage}"
                  </Text>
                </View>
              )}
            </View>

            {/* Practical Troubleshooting Guide */}
            {tips && tips.length > 0 && (
              <View style={styles.tipsSection}>
                <View style={styles.tipsHeaderRow}>
                  <HelpCircle size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>
                    Panduan & Langkah Solusi:
                  </Text>
                </View>

                <View style={styles.tipsList}>
                  {tips.map((tip, index) => (
                    <View key={index} style={styles.tipItemRow}>
                      <View
                        style={[
                          styles.tipBullet,
                          { backgroundColor: colors.primary + '22' },
                        ]}
                      >
                        <Text style={[styles.tipBulletNumber, { color: colors.primary }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canRevealPassword && (
              <Pressable
                onPress={handlePrimaryPress}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Eye size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>
                  {primaryActionText}
                </Text>
              </Pressable>
            )}

            {showRetryAction && (
              <Pressable
                onPress={handlePrimaryPress}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>
                  {primaryActionText}
                </Text>
              </Pressable>
            )}

            {!canRevealPassword && !showRetryAction && (
              <Pressable
                onPress={handlePrimaryPress}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <CheckCircle2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>
                  {primaryActionText}
                </Text>
              </Pressable>
            )}

            {(canRevealPassword || showRetryAction) && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: colors.cardSubtle,
                    borderColor: colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                  {secondaryActionText || 'Tutup'}
                </Text>
              </Pressable>
            )}
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
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 18,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  contextBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  contextHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contextLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    flexShrink: 1,
    marginLeft: 8,
  },
  rawMessageBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  rawMessageText: {
    fontSize: typography.sizes.micro + 1,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  tipsSection: {
    marginBottom: 12,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: typography.sizes.caption,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tipsList: {
    gap: 8,
  },
  tipItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  tipBulletNumber: {
    fontSize: typography.sizes.micro,
    fontWeight: '800',
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.caption - 0.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 14,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.caption,
    fontWeight: '700',
  },
});

export default LoginErrorModal;
