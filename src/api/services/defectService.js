import apiClient from '../client';
import { ENDPOINTS, getBaseUrl } from '../endpoints';
import { Platform } from 'react-native';
import {
  MASTER_PARTS,
  MASTER_MACHINES,
  MASTER_DEFECT_TYPES,
} from '../../data/masterData';

const FALLBACK_PARTS = MASTER_PARTS;
const FALLBACK_DEFECT_TYPES = MASTER_DEFECT_TYPES;
const FALLBACK_MACHINES = MASTER_MACHINES;

// Initial realistic local history buffer
let localHistoryBuffer = [
  {
    id: 101,
    partNumber: 'PT-1001',
    partName: 'Front Bracket A',
    defectName: 'Gompal',
    proses: 'Blanking',
    quantity: 8,
    operatorName: 'Budi Santoso',
    defectDate: '2026-10-13',
    time: '13:42',
    shift: 'Shift 1',
    namaMesin: 'Amada Press 01',
    remarks: 'Sisi kiri dekat lubang punching clearance aus',
    photoUrl: null,
    status: 'Synced to Cloud',
  },
  {
    id: 102,
    partNumber: 'PT-1003',
    partName: 'Side Reinforce L',
    defectName: 'Burry',
    proses: 'Blanking',
    quantity: 14,
    operatorName: 'Budi Santoso',
    defectDate: '2026-10-13',
    time: '11:15',
    shift: 'Shift 1',
    namaMesin: 'Amada Press 01',
    remarks: 'Tepi potong kasar >0.08mm, perlu regrinding die',
    photoUrl: null,
    status: 'Synced to Cloud',
  },
  {
    id: 103,
    partNumber: 'PT-1002',
    partName: 'Rear Flange B',
    defectName: 'Tidak Flat',
    proses: 'Bending',
    quantity: 5,
    operatorName: 'Budi Santoso',
    defectDate: '2026-10-12',
    time: '15:20',
    shift: 'Shift 2',
    namaMesin: 'Komatsu Press 02',
    remarks: 'Sudut tekuk melebar 2 derajat dari gambar kerja',
    photoUrl: null,
    status: 'Synced to Cloud',
  },
  {
    id: 104,
    partNumber: 'PT-1004',
    partName: 'Main Stay Plate',
    defectName: 'Keropos',
    proses: 'Welding Robot',
    quantity: 3,
    operatorName: 'Budi Santoso',
    defectDate: '2026-10-11',
    time: '09:30',
    shift: 'Shift 1',
    namaMesin: 'Welding Robot A',
    remarks: 'Gas shielding argon sempat tersumbat nozzle',
    photoUrl: null,
    status: 'Synced to Cloud',
  },
];

export const defectService = {
  getParts: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.PARTS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((p) => ({
          id: p.id,
          partNumber: p.partNumber,
          partName: p.partName,
          line: p.line || 'Stamping',
          status: p.status || 'Active',
        }));
      }
      return FALLBACK_PARTS;
    } catch (err) {
      console.warn('Gagal memuat master part dari database:', err?.message);
      return FALLBACK_PARTS;
    }
  },

  getDefectTypes: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.DEFECTS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category || 'Medium',
          proses: d.proses || 'Stamping',
          description: d.description || `Cacat ${d.name}`,
        }));
      }
      return FALLBACK_DEFECT_TYPES;
    } catch (err) {
      console.warn('Gagal memuat master defect dari database:', err?.message);
      return FALLBACK_DEFECT_TYPES;
    }
  },

  getMachines: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.MACHINES);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((m) => ({
          id: m.id,
          name: m.name,
          line: m.line || 'Stamping',
        }));
      }
      return FALLBACK_MACHINES;
    } catch (err) {
      console.warn('Gagal memuat master mesin dari database:', err?.message);
      return FALLBACK_MACHINES;
    }
  },

  uploadPhoto: async (uri) => {
    try {
      if (!uri) return null;

      const filename = uri.split('/').pop() || `defect_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type,
        });
      }

      const response = await apiClient.post(ENDPOINTS.UPLOAD_PHOTO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return typeof response.data === 'string' ? response.data : filename;
    } catch (err) {
      console.warn('Backend photo upload failed, using local URI reference:', err?.message);
      // Return local URI fallback so UI displays preview
      return uri;
    }
  },

  saveDefect: async (payload) => {
    try {
      const response = await apiClient.post(ENDPOINTS.NG_DATA, payload);
      
      // Also add to local history buffer for immediate UI feedback
      const newRecord = {
        id: response.data?.id || Date.now(),
        partNumber: payload.partNumber || `PT-${payload.partId}`,
        partName: payload.partName || 'Auto Bracket',
        defectName: payload.defectName || 'Gompal',
        proses: payload.proses || 'Blanking',
        quantity: payload.quantity || 1,
        operatorName: payload.operatorName || 'Budi Santoso',
        createdBy: payload.username || payload.createdBy || 'budi_qc',
        defectDate: payload.defectDate || new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        shift: payload.shift || 'Shift 1',
        namaMesin: payload.namaMesin || 'Amada Press 01',
        remarks: payload.remarks || '',
        photoUrl: payload.photoUrl || null,
        status: 'Synced to Cloud',
      };
      localHistoryBuffer = [newRecord, ...localHistoryBuffer];

      return response.data;
    } catch (err) {
      console.warn('Backend saveDefect failed, saving to offline buffer:', err?.message);
      
      const offlineRecord = {
        id: Date.now(),
        partNumber: payload.partNumber || `PT-${payload.partId}`,
        partName: payload.partName || 'Auto Bracket',
        defectName: payload.defectName || 'Gompal',
        proses: payload.proses || 'Blanking',
        quantity: payload.quantity || 1,
        operatorName: payload.operatorName || 'Budi Santoso',
        createdBy: payload.username || payload.createdBy || 'budi_qc',
        defectDate: payload.defectDate || new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        shift: payload.shift || 'Shift 1',
        namaMesin: payload.namaMesin || 'Amada Press 01',
        remarks: payload.remarks || '',
        photoUrl: payload.photoUrl || null,
        status: 'Cached Locally (Offline)',
      };
      localHistoryBuffer = [offlineRecord, ...localHistoryBuffer];
      return offlineRecord;
    }
  },

  getHistory: async (filterPeriod = 'all', username = null, role = null) => {
    try {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      const params = {};
      if (role) params.role = role;
      if (!isAdmin && username) params.username = username;

      const response = await apiClient.get(ENDPOINTS.NG_DATA, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((item) => ({
          id: item.id,
          partNumber: item.part?.partNumber || item.partNumber || 'PT-1001',
          partName: item.part?.partName || item.partName || 'Front Bracket',
          defectName: item.defectType?.name || item.defectName || 'Defect',
          proses: item.proses || 'Blanking',
          quantity: item.quantity || 0,
          operatorName: item.operatorName || item.createdBy || 'Operator',
          createdBy: item.createdBy,
          defectDate: item.defectDate || '2026-10-13',
          time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '12:00',
          shift: item.shift || 'Shift 1',
          namaMesin: item.namaMesin || 'Amada Press 01',
          remarks: item.remarks || '',
          photoUrl: item.photoUrl,
          status: 'Synced to Cloud',
        }));
        
        // Filter by user if operator
        const userFiltered = isAdmin ? mapped : filterDefectsByUser(mapped, username);

        // Merge with any freshly added local records not yet returned
        const existingIds = new Set(userFiltered.map(m => m.id));
        const filteredBuffer = isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username);
        const combined = [...filteredBuffer.filter(loc => !existingIds.has(loc.id)), ...userFiltered];
        return applyPeriodFilter(combined, filterPeriod);
      }
      return applyPeriodFilter(isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username), filterPeriod);
    } catch {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      return applyPeriodFilter(isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username), filterPeriod);
    }
  },
};

const filterDefectsByUser = (items, username) => {
  if (!username || username.toLowerCase() === 'admin') return items;
  const target = username.toLowerCase();
  return items.filter(
    (item) =>
      (item.createdBy && item.createdBy.toLowerCase() === target) ||
      (item.operatorName && item.operatorName.toLowerCase().includes(target))
  );
};

const applyPeriodFilter = (items, period) => {
  if (period === 'all') return items;

  const todayStr = new Date().toISOString().split('T')[0];
  if (period === 'today') {
    return items.filter(item => item.defectDate === todayStr);
  }

  if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    return items.filter(item => item.defectDate >= weekAgoStr);
  }

  return items;
};

export default defectService;
