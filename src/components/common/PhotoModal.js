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
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { compressImage } from '../../utils/imageCompressor';
import { typography } from '../../theme/typography';

/**
 * PhotoModal: Modern Industrial Bottom Sheet Drawer for Photo Capture
 * Ergonomic drag handle, 28px corner radius, tactile glove-friendly actions.
 */
export const PhotoModal = ({ visible, onClose, onImageSelected }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(400)).current;
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
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert('Izin kamera diperlukan untuk memotret produk cacat!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const compressed = await compressImage(result.assets[0].uri);
        onImageSelected(compressed ? compressed.uri : result.assets[0].uri);
        onClose();
      }
    } catch (err) {
      console.warn('Camera launch error:', err);
      onClose();
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Izin galeri diperlukan untuk memilih foto bukti cacat!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const compressed = await compressImage(result.assets[0].uri);
        onImageSelected(compressed ? compressed.uri : result.assets[0].uri);
        onClose();
      }
    } catch (err) {
      console.warn('Gallery launch error:', err);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop Overlay */}
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

        {/* Sliding Bottom Sheet */}
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
          {/* Ergonomic Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Sumber Bukti Foto Defect
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            >
              <X size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
            Ambil potret langsung part di lini perakitan atau pilih dari dokumen galeri.
          </Text>

          {/* Action Options (Glove-Friendly Touch Targets) */}
          <View style={styles.optionsList}>
            {/* Option 1: Kamera Langsung */}
            <Pressable
              onPress={handleLaunchCamera}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { borderColor: colors.primary, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '20' }]}>
                <Camera size={26} color={colors.primary} />
              </View>
              <View style={styles.actionDetails}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                  Kamera Langsung (Shop Floor)
                </Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                  Potret part cacat langsung di depan mesin stempel/welding
                </Text>
              </View>
            </Pressable>

            {/* Option 2: Dari Galeri HP */}
            <Pressable
              onPress={handleLaunchGallery}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: colors.cardSubtle, borderColor: colors.border },
                pressed && { borderColor: colors.primary, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.aiAccent + '20' }]}>
                <ImageIcon size={26} color={colors.aiAccentLight || colors.primary} />
              </View>
              <View style={styles.actionDetails}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                  Pilih dari Galeri HP
                </Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                  Gunakan foto inspeksi tersimpan dari album perangkat
                </Text>
              </View>
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
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sheetTitle: {
    fontSize: typography.sizes.screenHeading,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  sheetSubtitle: {
    fontSize: typography.sizes.body,
    marginTop: 4,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 72,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionDetails: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.sizes.cardHeading,
    fontWeight: '700',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: typography.sizes.caption,
    lineHeight: 16,
  },
});

export default PhotoModal;
