import apiClient from '../client';
import { ENDPOINTS, getApiHost } from '../endpoints';

export const authService = {
  /**
   * Validasi Login Pengguna langsung ke Database via Spring Boot
   * POST /api/auth/login
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, {
        username: username ? username.trim() : '',
        password,
      });

      // Data user berhasil divalidasi dari database
      return response.data;
    } catch (error) {
      if (error.response) {
        // Validasi database gagal (401 Unauthorized, 400 Bad Request)
        const serverMsg =
          error.response.data?.message ||
          (typeof error.response.data === 'string' ? error.response.data : null);
        throw new Error(
          serverMsg || 'Kredensial tidak valid di database. Periksa kembali username dan kata sandi!'
        );
      }

      // Kesalahan jaringan / koneksi server database
      const host = getApiHost();
      throw new Error(
        `Tidak dapat menghubungi server database (http://${host}:8080). Pastikan server backend Spring Boot aktif.`
      );
    }
  },

  /**
   * Registrasi Pengguna Baru ke Database
   * POST /api/auth/register
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(msg || 'Gagal mendaftarkan user ke database.');
    }
  },

  /**
   * Update Profil Pengguna di Database
   * PUT /api/users/update-profile
   */
  updateProfile: async ({ fullName, email, password }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.UPDATE_PROFILE, {
        fullName,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(msg || 'Gagal memperbarui profil pengguna di database.');
    }
  },

  /**
   * Ubah Kata Sandi Pengguna di Database
   * PUT /api/users/update-profile
   */
  changePassword: async (newPassword, oldPassword, fullName, email) => {
    try {
      const response = await apiClient.put(ENDPOINTS.UPDATE_PROFILE, {
        fullName: fullName || 'Budi Santoso',
        email: email || 'budi_qc@galaxy-mandiri.co.id',
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message;
      throw new Error(msg || 'Gagal memperbarui kata sandi pengguna di database.');
    }
  },
};

export default authService;
