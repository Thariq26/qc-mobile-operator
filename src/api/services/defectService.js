import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';
import { ENDPOINTS, getBaseUrl } from '../endpoints';
import { Platform } from 'react-native';
import { getLocalDateString } from '../../utils/dateFormatter';
import { userService } from './userService';
// Kunci penyimpanan cache dinamis di memori lokal HP (Dynamic Offline Cache)
const CACHE_KEYS = {
  PARTS: '@qc_cached_parts_v1',
  DEFECT_TYPES: '@qc_cached_defect_types_v1',
  MACHINES: '@qc_cached_machines_v1',
};

// Helper membaca cache lokal jika offline
const getLocalCache = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn(`Failed reading cache for ${key}:`, e);
    return [];
  }
};

// Helper menyimpan cache lokal dari database
const setLocalCache = async (key, data) => {
  try {
    if (Array.isArray(data) && data.length > 0) {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`Failed writing cache for ${key}:`, e);
  }
};

const DEFECT_STORAGE_KEY = '@qc_local_defect_history_buffer_v2';

// Persisted local history buffer for offline shop floor recording
let localHistoryBuffer = [];

// Load persisted local defect buffer on initialization
(async () => {
  try {
    const saved = await AsyncStorage.getItem(DEFECT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Only keep genuinely offline pending records and filter out demo/stale items
        localHistoryBuffer = parsed.filter((item) => {
          const isPendingOffline = item.isOffline === true || (item.status && item.status.includes('Offline'));
          const isDemo =
            (item.createdBy === 'budi_qc' && item.remarks && item.remarks.includes('clearance aus')) ||
            (item.namaMesin === 'Amada Press 01' && item.quantity === 8 && item.defectName === 'Gompal');
          return isPendingOffline && !isDemo && (item.id < 101 || item.id > 105);
        });
        await persistLocalDefectBuffer();
      }
    }
  } catch (e) {
    console.warn('Failed loading persisted defect history buffer:', e);
  }
})();

const persistLocalDefectBuffer = async () => {
  try {
    await AsyncStorage.setItem(DEFECT_STORAGE_KEY, JSON.stringify(localHistoryBuffer.slice(0, 50)));
  } catch (e) {
    console.warn('Failed persisting defect history buffer:', e);
  }
};

// Helper menentukan lini part (Welding vs Stamping)
const resolvePartLine = (p) => {
  if (!p) return 'Stamping';
  if (p.line && (p.line.toLowerCase().includes('weld') || p.line.toLowerCase().includes('bend'))) {
    return p.line;
  }
  const text = `${p.partName || ''} ${p.partNumber || ''}`.toLowerCase();
  if (
    text.includes('grabrail') ||
    text.includes('cross member') ||
    text.includes('side member') ||
    text.includes('subframe') ||
    text.includes('welding') ||
    text.includes('frame') ||
    text.includes('rail') ||
    text.includes('stay comp') ||
    text.includes('pillar') ||
    text.includes('gusset') ||
    text.includes('pipe') ||
    text.includes('tower')
  ) {
    return 'Welding';
  }
  return 'Stamping';
};

export const defectService = {
  getParts: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.PARTS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((p) => ({
          id: p.id,
          partNumber: p.partNumber,
          partName: p.partName,
          line: resolvePartLine(p),
          status: p.status || 'Active',
        }));
        await setLocalCache(CACHE_KEYS.PARTS, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Gagal memuat master part dari database, membaca cache lokal:', err?.message);
    }
    const cached = await getLocalCache(CACHE_KEYS.PARTS);
    return (cached || []).map((p) => ({
      ...p,
      line: resolvePartLine(p),
    }));
  },

  getDefectTypes: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.DEFECTS);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category || 'Medium',
          proses: d.proses || 'Stamping',
          description: d.description || `Cacat ${d.name}`,
        }));
        await setLocalCache(CACHE_KEYS.DEFECT_TYPES, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Gagal memuat master defect dari database, membaca cache lokal:', err?.message);
    }
    return await getLocalCache(CACHE_KEYS.DEFECT_TYPES);
  },

  getMachines: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.MACHINES);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((m) => ({
          id: m.id,
          name: m.name,
          line: m.line || 'Stamping',
        }));
        await setLocalCache(CACHE_KEYS.MACHINES, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Gagal memuat master mesin dari database, membaca cache lokal:', err?.message);
    }
    return await getLocalCache(CACHE_KEYS.MACHINES);
  },

  getOperators: async (role = 'OPERATOR_PRODUKSI') => {
    // Delegated to single source of truth in userService
    return userService.getOperators(role);
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
      
      // Clean up any matching offline pending record since it is now successfully saved in cloud
      const serverId = response.data?.id;
      const targetDate = payload.defectDate || getLocalDateString();
      const targetShift = payload.shift || 'Shift 1';
      const targetMachine = payload.namaMesin || '';
      const targetDefect = payload.defectName || '';
      const targetQty = Number(payload.quantity || 1);

      localHistoryBuffer = localHistoryBuffer.filter((i) => {
        if (serverId && i.id === serverId) return false;
        const matchesData =
          i.defectDate === targetDate &&
          i.shift === targetShift &&
          i.namaMesin === targetMachine &&
          i.defectName === targetDefect &&
          Number(i.quantity) === targetQty;
        return !matchesData;
      });
      await persistLocalDefectBuffer();

      return response.data;
    } catch (err) {
      console.warn('Backend saveDefect failed, saving to offline buffer:', err?.message);
      
      const offlineRecord = {
        id: Date.now(),
        partId: payload.partId,
        partNumber: payload.partNumber || `PT-${payload.partId}`,
        partName: payload.partName || 'Auto Bracket',
        defectTypeId: payload.defectTypeId,
        defectName: payload.defectName || 'Gompal',
        proses: payload.proses || 'Blanking',
        quantity: payload.quantity || 1,
        operatorName: payload.operatorName || 'Operator',
        createdBy: payload.username || payload.createdBy || 'operator',
        defectDate: payload.defectDate || getLocalDateString(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        shift: payload.shift || 'Shift 1',
        namaMesin: payload.namaMesin || 'Amada Press 01',
        remarks: payload.remarks || '',
        photoUrl: payload.photoUrl || null,
        status: 'Cached Locally (Offline)',
        isOffline: true,
      };
      localHistoryBuffer = [offlineRecord, ...localHistoryBuffer];
      await persistLocalDefectBuffer();
      return offlineRecord;
    }
  },

  /**
   * Auto-sync pending offline defects when online connection restored
   */
  syncOfflineDefects: async () => {
    const offlineItems = localHistoryBuffer.filter((i) => i.isOffline === true || i.status?.includes('Offline'));
    if (offlineItems.length === 0) return { synced: 0 };

    let syncedCount = 0;
    const syncedIds = new Set();

    for (const item of offlineItems) {
      try {
        let finalPhotoUrl = item.photoUrl;

        // Re-upload photo if it was saved locally as a file URI during offline mode
        if (
          finalPhotoUrl &&
          (finalPhotoUrl.startsWith('file://') || finalPhotoUrl.startsWith('content://'))
        ) {
          try {
            finalPhotoUrl = await defectService.uploadPhoto(finalPhotoUrl);
          } catch (uploadErr) {
            console.warn(`[Sync NG] Re-upload photo failed for defect ${item.id}:`, uploadErr?.message);
          }
        }

        const payload = {
          partId: item.partId,
          partNumber: item.partNumber,
          partName: item.partName,
          defectTypeId: item.defectTypeId,
          defectName: item.defectName,
          proses: item.proses,
          quantity: item.quantity,
          operatorName: item.operatorName,
          username: item.createdBy,
          defectDate: item.defectDate,
          shift: item.shift,
          namaMesin: item.namaMesin,
          remarks: item.remarks,
          photoUrl: finalPhotoUrl,
        };

        const res = await apiClient.post(ENDPOINTS.NG_DATA, payload);
        if (res.status === 200 || res.status === 201 || res.data) {
          syncedIds.add(item.id);
          syncedCount++;
        }
      } catch (e) {
        console.warn(`Sync failed for offline defect ${item.id}:`, e?.message);
      }
    }

    if (syncedIds.size > 0) {
      // Remove successfully synced items from local buffer to prevent stale duplicates
      localHistoryBuffer = localHistoryBuffer.filter((i) => !syncedIds.has(i.id));
      await persistLocalDefectBuffer();
    }
    return { synced: syncedCount };
  },

  /**
   * Get count of currently unsynced offline defect records
   */
  getPendingOfflineCount: () => {
    return localHistoryBuffer.filter((i) => i.isOffline === true || i.status?.includes('Offline')).length;
  },

  /**
   * Clear offline defect buffer (used to reset corrupted / stuck records)
   */
  clearOfflineBuffer: async () => {
    localHistoryBuffer = [];
    try {
      await AsyncStorage.removeItem(DEFECT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed clearing local defect buffer:', e);
    }
    return true;
  },

  getHistory: async (filterPeriod = 'all', username = null, role = null) => {
    try {
      // 0. Auto-sync any pending offline records before fetching fresh data
      try {
        await defectService.syncOfflineDefects();
      } catch (syncErr) {
        // Silently continue if offline
      }

      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      const params = {};
      if (role) params.role = role;
      if (!isAdmin && username) params.username = username;

      const response = await apiClient.get(ENDPOINTS.NG_DATA, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((item) => ({
          id: item.id,
          partId: item.part?.id,
          partNumber: item.part?.partNumber || item.partNumber || 'PT-1001',
          partName: item.part?.partName || item.partName || 'Front Bracket',
          defectName: item.defectType?.name || item.defectName || 'Defect',
          proses: item.proses || 'Blanking',
          quantity: Number(item.quantity || 0),
          operatorName: item.operatorName || item.createdBy || 'Operator',
          createdBy: item.createdBy,
          defectDate: item.defectDate ? String(item.defectDate).split('T')[0] : getLocalDateString(),
          time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '12:00',
          shift: item.shift || 'Shift 1',
          namaMesin: item.namaMesin || 'Amada Press 01',
          remarks: item.remarks || '',
          photoUrl: item.photoUrl,
          status: 'Synced to Cloud',
          isOffline: false,
        }));
        
        // Filter by user if operator
        const userFiltered = isAdmin ? mapped : filterDefectsByUser(mapped, username);

        // Deduplicate and prune local buffer
        const serverIds = new Set(userFiltered.map((m) => m.id));
        const serverKeys = new Set(
          userFiltered.map((m) => `${m.defectDate}_${m.shift}_${m.namaMesin}_${m.defectName}_${m.quantity}`)
        );

        const filteredBuffer = isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username);
        const unmergedOffline = filteredBuffer.filter((loc) => {
          if (!loc.isOffline && !(loc.status && loc.status.includes('Offline'))) return false;
          if (serverIds.has(loc.id)) return false;
          const key = `${loc.defectDate}_${loc.shift}_${loc.namaMesin}_${loc.defectName}_${loc.quantity}`;
          return !serverKeys.has(key);
        });
        const combined = [...unmergedOffline, ...userFiltered];
        return applyPeriodFilter(combined, filterPeriod);
      }
      return applyPeriodFilter(isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username), filterPeriod);
    } catch {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      return applyPeriodFilter(isAdmin ? localHistoryBuffer : filterDefectsByUser(localHistoryBuffer, username), filterPeriod);
    }
  },

  /**
   * Fetch all shop floor defects across the entire plant (unrestricted by operator identity)
   * Essential for connecting QC defect findings with production runs regardless of who inspected it.
   */
  getShopFloorDefects: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.NG_DATA, { params: { role: 'ADMIN' } });
      let mapped = [];
      if (Array.isArray(response.data) && response.data.length > 0) {
        mapped = response.data.map((item) => ({
          id: item.id,
          partId: item.part?.id,
          partNumber: item.part?.partNumber || item.partNumber || 'PT-1001',
          partName: item.part?.partName || item.partName || 'Front Bracket',
          defectName: item.defectType?.name || item.defectName || 'Defect',
          proses: item.proses || 'Blanking',
          quantity: Number(item.quantity || 0),
          operatorName: item.operatorName || item.createdBy || 'Operator',
          createdBy: item.createdBy,
          defectDate: item.defectDate ? String(item.defectDate).split('T')[0] : getLocalDateString(),
          time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '12:00',
          shift: item.shift || 'Shift 1',
          namaMesin: item.namaMesin || 'Amada Press 01',
          remarks: item.remarks || '',
          photoUrl: item.photoUrl,
          status: 'Synced to Cloud',
          isOffline: false,
        }));
      }

      // Server IDs and composite keys to prevent any duplicate merging
      const serverIds = new Set(mapped.map((m) => m.id));
      const serverKeys = new Set(
        mapped.map((m) => `${m.defectDate}_${m.shift}_${m.namaMesin}_${m.defectName}_${m.quantity}`)
      );

      // Prune local buffer: remove any records that are already on the server or not offline
      const prevCount = localHistoryBuffer.length;
      localHistoryBuffer = (localHistoryBuffer || []).filter((loc) => {
        if (!loc.isOffline && !(loc.status && loc.status.includes('Offline'))) return false;
        if (serverIds.has(loc.id)) return false;
        const key = `${loc.defectDate}_${loc.shift}_${loc.namaMesin}_${loc.defectName}_${loc.quantity}`;
        return !serverKeys.has(key);
      });
      if (localHistoryBuffer.length !== prevCount) {
        await persistLocalDefectBuffer();
      }

      // Only merge genuinely pending offline items
      const unmergedOffline = localHistoryBuffer.filter(
        (loc) => loc.isOffline === true || (loc.status && loc.status.includes('Offline'))
      );

      return [...unmergedOffline, ...mapped];
    } catch (e) {
      console.warn('Failed loading shop floor defects from cloud:', e?.message);
      return (localHistoryBuffer || []).map((item) => ({
        id: item.id,
        partId: item.partId,
        partNumber: item.partNumber || `PT-${item.partId}`,
        partName: item.partName || 'Auto Bracket',
        defectName: item.defectName || 'Gompal',
        proses: item.proses || 'Blanking',
        quantity: Number(item.quantity || 0),
        operatorName: item.operatorName || item.createdBy || 'Operator',
        createdBy: item.createdBy,
        defectDate: item.defectDate ? String(item.defectDate).split('T')[0] : getLocalDateString(),
        time: item.time || '12:00',
        shift: item.shift || 'Shift 1',
        namaMesin: item.namaMesin || 'Amada Press 01',
        remarks: item.remarks || '',
        photoUrl: item.photoUrl,
        status: item.status || 'Cached Locally (Offline)',
      }));
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
