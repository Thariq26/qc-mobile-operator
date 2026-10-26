import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { MASTER_PARTS, MASTER_MACHINES } from '../../data/masterData';
import { getLocalDateString, normalizeDateString } from '../../utils/dateFormatter';
import { defectService } from './defectService';
import { syncProductionWithDefects } from '../../utils/productionDefectMatcher';

const PROD_STORAGE_KEY = '@qc_local_production_buffer_v2';

// Clean in-memory buffer for offline shop floor recording
let localProductionBuffer = [];

// Load persisted local buffer on initialization
(async () => {
  try {
    const saved = await AsyncStorage.getItem(PROD_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy dummy entries
        localProductionBuffer = parsed.filter((item) => {
          const isDemo =
            item.id === 1 ||
            item.id === 2 ||
            (item.createdBy === 'budi_qc' && item.targetQuantity === 4000 && item.producedQuantity === 4150) ||
            (item.createdBy === 'budi_qc' && item.targetQuantity === 3000 && item.producedQuantity === 2880);
          return !isDemo;
        });
      }
    }
  } catch (e) {
    console.warn('Failed loading persisted production buffer:', e);
  }
})();

const persistLocalBuffer = async () => {
  try {
    await AsyncStorage.setItem(PROD_STORAGE_KEY, JSON.stringify(localProductionBuffer.slice(0, 50)));
  } catch (e) {
    console.warn('Failed persisting production buffer:', e);
  }
};

export const productionService = {
  /**
   * Save Batch Production data (Multiple machines per shift/line)
   * @param {Object} payload - { productionDate, shift, line, items: [...] }
   */
  saveBatchProduction: async (payload) => {
    try {
      const response = await apiClient.post(ENDPOINTS.PRODUCTION_BATCH, payload);

      // Cache locally for instant UI update
      if (Array.isArray(payload.items)) {
        payload.items.forEach((item, idx) => {
          const target = Number(item.targetQuantity || 0);
          const grossProduced = Number(item.producedQuantity || 0);
          const totalNg = Number(item.ngQuantity || item.totalNg || 0);
          const netProduced = Math.max(0, grossProduced - totalNg);
          const variance = netProduced - target;
          const efficiency = target > 0
            ? Number(((netProduced / target) * 100).toFixed(2))
            : 100;
          const status = netProduced >= target ? 'On Target' : 'Below Target';

          localProductionBuffer.unshift({
            id: Date.now() + idx,
            productionDate: normalizeDateString(payload.productionDate) || getLocalDateString(),
            createdAt: new Date().toISOString(),
            shift: payload.shift,
            line: item.line || payload.line,
            machineName: item.machineName,
            partId: item.partId,
            partNumber: item.partNumber || `PT-${item.partId}`,
            partName: item.partName || 'Part Produksi',
            processName: item.processName,
            targetQuantity: target,
            producedQuantity: grossProduced,
            target,
            grossProduced,
            produced: grossProduced,
            totalNg,
            netProduced,
            variance,
            efficiency,
            status,
            operatorName: payload.operatorName || 'Operator',
            createdBy: payload.username || payload.createdBy || 'operator',
          });
        });
        await persistLocalBuffer();

        // Automatically schedule background sync retry in 5 seconds
        setTimeout(() => {
          productionService.syncOfflineProduction().catch(() => {});
        }, 5000);
      }

      return response.data;
    } catch (error) {
      console.warn('Backend saveBatchProduction failed, saving to local offline buffer:', error?.message);

      // Save to local offline buffer so shop floor operators never lose records
      if (Array.isArray(payload.items)) {
        payload.items.forEach((item, idx) => {
          const target = Number(item.targetQuantity || 0);
          const grossProduced = Number(item.producedQuantity || 0);
          const totalNg = Number(item.ngQuantity || item.totalNg || 0);
          const netProduced = Math.max(0, grossProduced - totalNg);
          const variance = netProduced - target;
          const efficiency = target > 0
            ? Number(((netProduced / target) * 100).toFixed(2))
            : 100;
          const status = netProduced >= target ? 'On Target' : 'Below Target';

          localProductionBuffer.unshift({
            id: Date.now() + idx,
            productionDate: normalizeDateString(payload.productionDate) || getLocalDateString(),
            createdAt: new Date().toISOString(),
            shift: payload.shift,
            line: item.line || payload.line,
            machineName: item.machineName,
            partId: item.partId,
            partNumber: item.partNumber || `PT-${item.partId}`,
            partName: item.partName || 'Part Produksi',
            processName: item.processName,
            targetQuantity: target,
            producedQuantity: grossProduced,
            target,
            grossProduced,
            produced: grossProduced,
            totalNg,
            netProduced,
            variance,
            efficiency,
            status,
            operatorName: payload.operatorName || 'Operator',
            createdBy: payload.username || payload.createdBy || 'operator',
            isOffline: true,
          });
        });
        await persistLocalBuffer();

        // Automatically schedule background sync retry in 5 seconds
        setTimeout(() => {
          productionService.syncOfflineProduction().catch(() => {});
        }, 5000);
      }

      return {
        message: 'Data produksi berhasil disimpan (Mode Offline Lokal)!',
        offlineSaved: true,
      };
    }
  },

  /**
   * Save single production item
   */
  saveProduction: async (payload) => {
    try {
      const response = await apiClient.post(ENDPOINTS.PRODUCTION, payload);
      return response.data;
    } catch (error) {
      console.warn('Backend saveProduction failed:', error?.message);
      return {
        message: 'Data produksi disimpan lokal!',
      };
    }
  },

  /**
   * Auto-sync pending offline production batches when connection is restored
   * Automatically groups unsynced items and sends them via /api/production/batch
   */
  syncOfflineProduction: async () => {
    // Identify pending items (either explicitly marked offline or temporary local timestamp IDs)
    const pendingItems = localProductionBuffer.filter(
      (i) => i.isOffline === true || (typeof i.id === 'number' && i.id > 1000000000)
    );

    if (pendingItems.length === 0) return { synced: 0 };

    // Group pending items by batch context: (date + shift + line + createdBy)
    const groups = {};
    pendingItems.forEach((item) => {
      const pDate = normalizeDateString(item.productionDate) || getLocalDateString();
      const shift = item.shift || 'Shift 1';
      const line = item.line || 'Stamping';
      const user = item.createdBy || 'operator';
      const key = `${pDate}_${shift}_${line}_${user}`;

      if (!groups[key]) {
        groups[key] = {
          productionDate: pDate,
          shift,
          line,
          operatorName: item.operatorName || 'Operator',
          username: user,
          createdBy: user,
          items: [],
          localIds: [],
        };
      }

      groups[key].items.push({
        machineName: item.machineName,
        line: item.line || line,
        partId: Number(item.partId),
        processName: item.processName || 'Blanking',
        targetQuantity: Number(item.targetQuantity || item.target || 0),
        producedQuantity: Number(item.producedQuantity || item.produced || item.grossProduced || 0),
      });
      groups[key].localIds.push(item.id);
    });

    let totalSynced = 0;
    const syncedIds = new Set();

    for (const key of Object.keys(groups)) {
      const grp = groups[key];
      try {
        const payload = {
          productionDate: grp.productionDate,
          shift: grp.shift,
          line: grp.line,
          operatorName: grp.operatorName,
          username: grp.username,
          createdBy: grp.createdBy,
          items: grp.items,
        };

        const response = await apiClient.post(ENDPOINTS.PRODUCTION_BATCH, payload);
        if (response?.status === 200 || response?.status === 201 || response?.data?.message) {
          grp.localIds.forEach((id) => syncedIds.add(id));
          totalSynced += grp.items.length;
        }
      } catch (e) {
        console.warn(`[Auto-Sync] Gagal mengirim batch ${key} ke database:`, e?.message);
      }
    }

    if (syncedIds.size > 0) {
      // Remove successfully synced items from local buffer so they are not duplicated
      localProductionBuffer = localProductionBuffer.filter((i) => !syncedIds.has(i.id));
      await persistLocalBuffer();
    }

    return { synced: totalSynced };
  },

  /**
   * Fetch production records (filtered by logged-in user if specified)
   */
  getProductionList: async (username, role, options = {}) => {
    try {
      // 0. Auto-sync any pending offline records in background before fetching
      try {
        await productionService.syncOfflineProduction();
      } catch (syncErr) {
        // Silently continue if offline
      }
      const cleanRole = role ? String(role).toUpperCase().trim() : '';
      const isAdmin = cleanRole.includes('ADMIN') || (username && String(username).toLowerCase().trim() === 'admin');
      const isStaffQc = cleanRole.includes('QC');
      const shouldGetAll = Boolean(options && options.all) || isAdmin || isStaffQc;

      const params = {};
      if (role) params.role = role;
      if (shouldGetAll) {
        params.all = 'true';
      } else if (username) {
        params.username = username;
      }

      // 1. Fetch shop floor defects to connect QC findings (even if reported on following day)
      let shopDefects = [];
      try {
        shopDefects = await defectService.getShopFloorDefects();
      } catch (e) {
        console.warn('Failed loading shop floor defects for production sync:', e?.message);
      }

      const response = await apiClient.get(ENDPOINTS.PRODUCTION, { params });
      if (Array.isArray(response.data)) {
        const rawMapped = response.data.map((item) => {
          const target = Number(item.targetQuantity || item.target || 0);
          const grossProduced = Number(item.producedQuantity || item.grossProduced || item.produced || 0);
          return {
            id: item.id,
            productionDate: normalizeDateString(item.productionDate) || getLocalDateString(),
            createdAt: item.createdAt ? String(item.createdAt) : null,
            shift: item.shift || 'Shift 1',
            line: item.line || 'Stamping',
            machineName: item.machineName || 'Mesin',
            processName: item.processName || 'Blanking',
            partId: item.part?.id || item.partId,
            partNumber: item.part?.partNumber || item.partNumber || `PT-${item.part?.id || 1001}`,
            partName: item.part?.partName || item.partName || 'Part Produksi',
            targetQuantity: target,
            producedQuantity: grossProduced,
            target,
            grossProduced,
            produced: grossProduced,
            totalNg: Number(item.totalNg || item.ngQuantity || 0),
            operatorName: item.operatorName || item.createdBy || 'Operator QC',
            createdBy: item.createdBy,
          };
        });

        // Filter by user only if operator and shouldGetAll is false
        const userFiltered = shouldGetAll ? rawMapped : filterProductionByUser(rawMapped, username);

        // Merge with local buffer items that haven't been returned by backend
        const existingIds = new Set(userFiltered.map((m) => m.id));
        const localCandidates = shouldGetAll
          ? localProductionBuffer
          : filterProductionByUser(localProductionBuffer, username);
        const unmergedLocal = localCandidates.filter((loc) => !existingIds.has(loc.id));
        const combined = [...unmergedLocal, ...userFiltered];

        // Synchronize with shop floor QC defects (dynamically computes totalNg, netProduced, variance, efficiency, status)
        return syncProductionWithDefects(combined, shopDefects);
      }

      const fallbackBase = shouldGetAll
        ? localProductionBuffer
        : filterProductionByUser(localProductionBuffer, username);
      return syncProductionWithDefects(fallbackBase, shopDefects);
    } catch (err) {
      console.warn('Gagal memuat daftar produksi dari database:', err?.message);
      const cleanRole = role ? String(role).toUpperCase().trim() : '';
      const isAdmin = cleanRole.includes('ADMIN') || (username && String(username).toLowerCase().trim() === 'admin');
      const isStaffQc = cleanRole.includes('QC');
      const shouldGetAll = Boolean(options && options.all) || isAdmin || isStaffQc;

      let fallbackDefects = [];
      try {
        fallbackDefects = await defectService.getShopFloorDefects();
      } catch (e) {
        // ignore
      }
      const fallbackBase = shouldGetAll
        ? localProductionBuffer
        : filterProductionByUser(localProductionBuffer, username);
      return syncProductionWithDefects(fallbackBase, fallbackDefects);
    }
  },

  /**
   * Quick machine list mapping by industrial production line from 29 Master Machines
   */
  getMachinesByLine: (line = 'Stamping') => {
    const filtered = MASTER_MACHINES.filter(
      (m) => m.line.toLowerCase() === line.toLowerCase()
    );
    if (filtered.length > 0) {
      return filtered.map((m) => m.name);
    }
    return MASTER_MACHINES.map((m) => m.name);
  },

  getParts: async () => {
    return defectService.getParts();
  },

  getMachines: async () => {
    return defectService.getMachines();
  },

  getAllMachines: () => MASTER_MACHINES,
  getAllParts: () => MASTER_PARTS,

  /**
   * Quick processes list mapping by industrial production line
   */
  getProcessesByLine: (line = 'Stamping') => {
    switch (line) {
      case 'Welding':
        return ['Spot Welding', 'Robot Welding', 'Arc Welding', 'Projection Welding'];
      case 'Painting':
        return ['Degreasing', 'ED Coating', 'Top Coat Spraying', 'Baking Oven'];
      case 'Assembly':
        return ['Sub-Assembly', 'Riveting', 'Bolting & Torque', 'Final Visual Check'];
      case 'Stamping':
      default:
        return ['Blanking', 'Piercing', 'Bending', 'Drawing'];
    }
  },
};

const filterProductionByUser = (items, username) => {
  if (!username) return [];
  if (username.toLowerCase() === 'admin') return items;
  const target = username.toLowerCase().trim();
  return items.filter(
    (item) =>
      (item.createdBy && item.createdBy.toLowerCase().trim() === target) ||
      (item.operatorName && item.operatorName.toLowerCase().trim().includes(target))
  );
};

export default productionService;
