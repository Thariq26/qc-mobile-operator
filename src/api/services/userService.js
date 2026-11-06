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
  getOperators: async (role = 'OPERATOR_PRODUKSI') => {
    try {
      const params = role && role !== 'ALL' ? { role } : {};
      const response = await apiClient.get(ENDPOINTS.USERS_OPERATORS, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Filter nama user: hanya tampilkan user dengan role Operator Produksi (kecualikan Admin)
        const filtered = response.data.filter((op) => {
          if (!op.role) return false;
          const r = String(op.role).toUpperCase().trim();
          if (role && role !== 'ALL') {
            const target = String(role).toUpperCase().trim();
            if (target === 'OPERATOR_PRODUKSI' || target === 'OPERATOR') {
              return r.includes('OPERATOR') && !r.includes('ADMIN');
            }
            if (target === 'ADMIN') return r.includes('ADMIN');
          }
          // Default: hanya user dengan role OPERATOR (bukan ADMIN)
          return r.includes('OPERATOR') && !r.includes('ADMIN');
        });

        const listToMap = filtered;
        const mapped = listToMap.map((op, idx) => ({
          id: op.id || idx + 1,
          username: op.username || `user_${idx + 1}`,
          fullName: op.fullName || op.name || op.username,
          role: op.role || 'OPERATOR_PRODUKSI',
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

    // Fallback: baca dari cache lokal (pastikan data cache juga difilter hanya operator)
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY_OPERATORS);
      if (raw) {
        const cached = JSON.parse(raw);
        return cached.filter((op) => {
          const r = String(op.role || '').toUpperCase();
          return r.includes('OPERATOR') && !r.includes('ADMIN');
        });
      }
      return [];
    } catch (e) {
      return [];
    }
  },
};

export default userService;
