import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

const CACHE_KEY_OPERATORS = '@qc_cached_operators_v2';

export const userService = {
  /**
   * Mengambil daftar nama operator lini produksi berdasarkan username
   * dengan Role "OPERATOR_PRODUKSI" dan "ADMIN" langsung dari Database Spring Boot.
   * Dilengkapi cache dinamis lokal (AsyncStorage) untuk kemampuan fallback offline.
   * Endpoint: GET /api/users/operators
   */
  getOperators: async (role = null) => {
    try {
      const params = role ? { role } : {};
      const response = await apiClient.get(ENDPOINTS.USERS_OPERATORS, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Filter nama user berdasarkan role OPERATOR_PRODUKSI dan ADMIN
        const filtered = response.data.filter((op) => {
          if (!op.role) return true;
          const r = String(op.role).toUpperCase().trim();
          if (role && role !== 'ALL') {
            const target = String(role).toUpperCase().trim();
            if (target === 'ADMIN') return r.includes('ADMIN');
            if (target === 'OPERATOR_PRODUKSI') return r.includes('OPERATOR');
          }
          return r.includes('OPERATOR') || r.includes('ADMIN');
        });

        const listToMap = filtered.length > 0 ? filtered : response.data;
        const mapped = listToMap.map((op, idx) => ({
          id: op.id || idx + 1,
          username: op.username || `user_${idx + 1}`,
          fullName: op.fullName || op.name || op.username,
          role: op.role || (op.username?.toLowerCase().includes('admin') ? 'ADMIN' : 'OPERATOR_PRODUKSI'),
          line: op.line || 'Lini Produksi',
        }));

        // Simpan ke cache lokal untuk offline fallback
        try {
          await AsyncStorage.setItem(CACHE_KEY_OPERATORS, JSON.stringify(mapped));
        } catch (e) {
          console.warn('Gagal menyimpan cache operator:', e);
        }

        return mapped;
      }
    } catch (err) {
      console.warn('userService: Gagal mengambil daftar operator dari backend, membaca cache lokal:', err?.message);
    }

    // Fallback: baca dari cache lokal (hasil sinkronisasi database sebelumnya)
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY_OPERATORS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
};

export default userService;
