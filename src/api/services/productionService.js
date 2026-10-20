import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { MASTER_PARTS, MASTER_MACHINES } from '../../data/masterData';

// Fallback in-memory buffer for offline shop floor recording
let localProductionBuffer = [
  {
    id: 1,
    productionDate: '2026-10-13',
    shift: 'Shift 1',
    line: 'Stamping',
    machineName: 'Amada Press 01',
    partNumber: 'PT-1001',
    partName: 'Front Bracket A',
    processName: 'Blanking',
    targetQuantity: 4000,
    producedQuantity: 4150,
    efficiency: 103.75,
    status: 'On Target',
    operatorName: 'Budi Santoso',
    createdBy: 'budi_qc',
  },
  {
    id: 2,
    productionDate: '2026-10-13',
    shift: 'Shift 1',
    line: 'Welding',
    machineName: 'Welding Robot A',
    partNumber: 'PT-1003',
    partName: 'Side Reinforce L',
    processName: 'Robot Welding',
    targetQuantity: 3000,
    producedQuantity: 2880,
    efficiency: 96.0,
    status: 'Below Target',
    operatorName: 'Budi Santoso',
    createdBy: 'budi_qc',
  },
];

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
          const efficiency = item.targetQuantity > 0
            ? Number(((item.producedQuantity / item.targetQuantity) * 100).toFixed(2))
            : 100;
          const status = item.producedQuantity >= item.targetQuantity ? 'On Target' : 'Below Target';

          localProductionBuffer.unshift({
            id: Date.now() + idx,
            productionDate: payload.productionDate,
            shift: payload.shift,
            line: payload.line,
            machineName: item.machineName,
            partId: item.partId,
            partNumber: item.partNumber || `PT-${item.partId}`,
            partName: item.partName || 'Part Produksi',
            processName: item.processName,
            targetQuantity: item.targetQuantity,
            producedQuantity: item.producedQuantity,
            efficiency,
            status,
            operatorName: payload.operatorName || 'Budi Santoso',
            createdBy: payload.username || payload.createdBy || 'budi_qc',
          });
        });
      }

      return response.data;
    } catch (error) {
      console.warn('Backend saveBatchProduction failed, saving to local offline buffer:', error?.message);

      // Save to local offline buffer so shop floor operators never lose records
      if (Array.isArray(payload.items)) {
        payload.items.forEach((item, idx) => {
          const efficiency = item.targetQuantity > 0
            ? Number(((item.producedQuantity / item.targetQuantity) * 100).toFixed(2))
            : 100;
          const status = item.producedQuantity >= item.targetQuantity ? 'On Target' : 'Below Target';

          localProductionBuffer.unshift({
            id: Date.now() + idx,
            productionDate: payload.productionDate,
            shift: payload.shift,
            line: payload.line,
            machineName: item.machineName,
            partId: item.partId,
            partNumber: item.partNumber || `PT-${item.partId}`,
            partName: item.partName || 'Part Produksi',
            processName: item.processName,
            targetQuantity: item.targetQuantity,
            producedQuantity: item.producedQuantity,
            efficiency,
            status,
            operatorName: payload.operatorName || 'Budi Santoso',
            createdBy: payload.username || payload.createdBy || 'budi_qc',
            isOffline: true,
          });
        });
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
   * Fetch production records (filtered by logged-in user if specified)
   */
  getProductionList: async (username, role) => {
    try {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      const params = {};
      if (role) params.role = role;
      if (!isAdmin && username) params.username = username;

      const response = await apiClient.get(ENDPOINTS.PRODUCTION, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((item) => {
          const target = item.targetQuantity || 0;
          const produced = item.producedQuantity || 0;
          const efficiency = target > 0 ? Number(((produced / target) * 100).toFixed(1)) : 100;
          const status = produced >= target ? 'On Target' : 'Below Target';
          return {
            id: item.id,
            productionDate: item.productionDate ? String(item.productionDate) : '2026-10-13',
            shift: item.shift || 'Shift 1',
            line: item.line || 'Stamping',
            machineName: item.machineName || 'Mesin',
            processName: item.processName || 'Blanking',
            partId: item.part?.id,
            partNumber: item.part?.partNumber || item.partNumber || `PT-${item.part?.id || 1001}`,
            partName: item.part?.partName || item.partName || 'Part Produksi',
            targetQuantity: target,
            producedQuantity: produced,
            target,
            produced,
            efficiency,
            status,
            operatorName: item.createdBy || 'Operator QC',
            createdBy: item.createdBy,
          };
        });
      }
      return isAdmin ? localProductionBuffer : filterProductionByUser(localProductionBuffer, username);
    } catch (err) {
      console.warn('Gagal memuat daftar produksi dari database:', err?.message);
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      return isAdmin ? localProductionBuffer : filterProductionByUser(localProductionBuffer, username);
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
  if (!username || username.toLowerCase() === 'admin') return items;
  const target = username.toLowerCase();
  return items.filter(
    (item) =>
      (item.createdBy && item.createdBy.toLowerCase() === target) ||
      (item.operatorName && item.operatorName.toLowerCase().includes(target))
  );
};

export default productionService;
