import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
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
   * Quick machine list mapping by industrial production line directly from cached/database machines
   */
  getMachinesByLine: async (line = 'Stamping') => {
    const machines = await defectService.getMachines();
    const filtered = machines.filter(
      (m) => (m.line || '').toLowerCase() === line.toLowerCase()
    );
    if (filtered.length > 0) {
      return filtered.map((m) => m.name);
    }
    return machines.map((m) => m.name);
  },

  getParts: async () => {
    return defectService.getParts();
  },

  getMachines: async () => {
    return defectService.getMachines();
  },

  getAllMachines: async () => defectService.getMachines(),
  getAllParts: async () => defectService.getParts(),

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
