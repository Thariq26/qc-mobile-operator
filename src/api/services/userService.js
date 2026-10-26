import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { MASTER_OPERATORS } from '../../data/masterData';

export const userService = {
  /**
   * Mengambil daftar nama operator lini produksi berdasarkan username
   * dengan Role "OPERATOR_PRODUKSI" dan "ADMIN"
   * Endpoint: GET /api/users/operators
   * Fallback: MASTER_OPERATORS (Offline buffer database user)
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
        return listToMap.map((op, idx) => ({
          id: op.id || idx + 1,
          username: op.username || `user_${idx + 1}`,
          fullName: op.fullName || op.name || op.username,
          role: op.role || (op.username?.toLowerCase().includes('admin') ? 'ADMIN' : 'OPERATOR_PRODUKSI'),
          line: op.line || 'Lini Produksi',
          shift: op.shift || (idx % 2 === 0 ? 'Shift 1' : 'Shift 2'),
        }));
      }
      return MASTER_OPERATORS;
    } catch (err) {
      console.warn('userService: Gagal mengambil daftar operator dari backend, fallback ke masterData:', err?.message);
      return MASTER_OPERATORS;
    }
  },
};

export default userService;
