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
      const host = getApiHost();
      let errorType = 'GENERAL';
      let title = 'Gagal Masuk';
      let message = 'Terjadi kesalahan saat proses login.';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const serverMsg =
          typeof data === 'string'
            ? data
            : data?.message || data?.error || (data?.errors ? JSON.stringify(data.errors) : '');

        if (status === 401) {
          // Kredensial tidak valid (Salah password atau user tidak cocok)
          errorType = 'WRONG_CREDENTIALS';
          title = 'Username atau Kata Sandi Salah';
          message =
            serverMsg ||
            'Kredensial tidak valid di database. Periksa kembali username dan kata sandi Anda!';
        } else if (
          status === 404 ||
          serverMsg.toLowerCase().includes('tidak ditemukan') ||
          serverMsg.toLowerCase().includes('not found') ||
          serverMsg.toLowerCase().includes('user not found')
        ) {
          errorType = 'USER_NOT_FOUND';
          title = 'Operator Tidak Ditemukan';
          message = serverMsg || `Username "${username}" belum terdaftar di sistem pabrik.`;
        } else if (status === 403) {
          errorType = 'FORBIDDEN';
          title = 'Akses Ditolak';
          message = serverMsg || 'Akun Anda dinonaktifkan atau tidak memiliki izin akses terminal.';
        } else if (status >= 500) {
          errorType = 'SERVER_ERROR';
          title = 'Gangguan Server Database';
          message = serverMsg || `Server backend mengalami gangguan internal (Status ${status}).`;
        } else {
          errorType = 'GENERAL';
          title = 'Autentikasi Ditolak';
          message = serverMsg || 'Permintaan login ditolak oleh server backend.';
        }
      } else if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
        errorType = 'TIMEOUT';
        title = 'Waktu Sambungan Habis (Timeout)';
        message = `Server di http://${host}:8080 tidak merespons dalam 10 detik.`;
      } else {
        // Network / Server offline / Connection refused
        errorType = 'NETWORK';
        title = 'Koneksi Jaringan Gagal';
        message = `Tidak dapat menghubungi server database (http://${host}:8080). Pastikan server backend Spring Boot aktif dan Wi-Fi terhubung.`;
      }

      const enhancedError = new Error(message);
      enhancedError.type = errorType;
      enhancedError.title = title;
      enhancedError.host = host;
      enhancedError.username = username ? username.trim() : '';
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
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
        fullName: fullName || '',
        email: email || '',
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
