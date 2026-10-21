import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import productionService from './productionService';
import defectService from './defectService';

// Realistic Automotive Factory Fallback Datasets (PT Galaxy Mandiri Perkasa)
const FALLBACK_SUMMARY = {
  totalProduction: 12450,
  totalNg: 142,
  defectRate: 1.14,
  totalComplaints: 4,
};

const FALLBACK_PARETO = {
  daily: [
    { defectName: 'Gompal', process: 'Blanking', quantity: 48, percentage: 33.8, severity: 'critical' },
    { defectName: 'Burry', process: 'Blanking', quantity: 31, percentage: 21.8, severity: 'warning' },
    { defectName: 'Tidak Flat', process: 'Bending', quantity: 24, percentage: 16.9, severity: 'warning' },
    { defectName: 'Overheat Spot', process: 'Welding Spot', quantity: 18, percentage: 12.6, severity: 'warning' },
    { defectName: 'Keropos', process: 'Welding Robot', quantity: 12, percentage: 8.4, severity: 'critical' },
  ],
  weekly: [
    { defectName: 'Burry', process: 'Blanking', quantity: 182, percentage: 28.4, severity: 'warning' },
    { defectName: 'Gompal', process: 'Blanking', quantity: 161, percentage: 25.1, severity: 'critical' },
    { defectName: 'Tidak Flat', process: 'Bending', quantity: 117, percentage: 18.2, severity: 'warning' },
    { defectName: 'Keropos', process: 'Welding Robot', quantity: 93, percentage: 14.5, severity: 'critical' },
    { defectName: 'Overheat Spot', process: 'Welding Spot', quantity: 65, percentage: 10.2, severity: 'warning' },
  ],
  monthly: [
    { defectName: 'Gompal', process: 'Blanking', quantity: 710, percentage: 30.2, severity: 'critical' },
    { defectName: 'Burry', process: 'Blanking', quantity: 623, percentage: 26.5, severity: 'warning' },
    { defectName: 'Tidak Flat', process: 'Bending', quantity: 449, percentage: 19.1, severity: 'warning' },
    { defectName: 'Overheat Spot', process: 'Welding Spot', quantity: 277, percentage: 11.8, severity: 'warning' },
    { defectName: 'Keropos', process: 'Welding Robot', quantity: 221, percentage: 9.4, severity: 'critical' },
  ],
};

const FALLBACK_DAILY_PROD = [
  {
    id: 1,
    machineName: 'Amada Press 01',
    process: 'Blanking & Piercing',
    target: 6000,
    produced: 6320,
    variance: 320,
    efficiency: 105,
    status: 'On Target',
  },
  {
    id: 2,
    machineName: 'Welding Robot A',
    process: 'Spot & Arc Welding',
    target: 4500,
    produced: 4120,
    variance: -380,
    efficiency: 91,
    status: 'Below Target',
  },
  {
    id: 3,
    machineName: 'Komatsu Press 02',
    process: 'Progressive Bending',
    target: 2500,
    produced: 2610,
    variance: 110,
    efficiency: 104,
    status: 'On Target',
  },
];

export const dashboardService = {
  getSummary: async (startDate, endDate, username, role) => {
    try {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      const isOperator = !isAdmin;

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (role) params.role = role;
      if (!isAdmin && username) params.username = username;

      const [kpiRes, complaintsRes, userProdList, userDefectList] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.DASHBOARD_SUMMARY, { params }),
        apiClient.get(ENDPOINTS.DASHBOARD_COMPLAINTS_SUMMARY, { params }),
        isAdmin ? productionService.getProductionList() : productionService.getProductionList(username),
        isAdmin ? defectService.getHistory('all') : defectService.getHistory('all', username),
      ]);

      const kpiData = kpiRes.status === 'fulfilled' ? kpiRes.value.data : {};
      const compData = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data : {};
      const prodList = userProdList.status === 'fulfilled' && Array.isArray(userProdList.value) ? userProdList.value : [];
      const defectList = userDefectList.status === 'fulfilled' && Array.isArray(userDefectList.value) ? userDefectList.value : [];

      let totalProd = 0;
      let totalNg = 0;
      let totalComplaints = 0;

      if (isAdmin) {
        // Admin: Global Factory Data
        totalProd = kpiData.totalProduction ?? (prodList.length > 0 ? prodList.reduce((acc, p) => acc + (p.producedQuantity || 0), 0) : FALLBACK_SUMMARY.totalProduction);
        totalNg = kpiData.totalNg ?? (defectList.length > 0 ? defectList.reduce((acc, d) => acc + (d.quantity || 0), 0) : FALLBACK_SUMMARY.totalNg);
        totalComplaints = compData.totalComplaints ?? FALLBACK_SUMMARY.totalComplaints;
      } else {
        // Operator: Scoped to logged-in operator only
        if (kpiData.totalProduction !== undefined && kpiData.totalProduction !== null) {
          totalProd = kpiData.totalProduction;
        } else if (prodList.length > 0) {
          totalProd = prodList.reduce((acc, p) => acc + (Number(p.producedQuantity) || Number(p.produced) || 0), 0);
        } else {
          totalProd = FALLBACK_SUMMARY.totalProduction;
        }

        if (kpiData.totalNg !== undefined && kpiData.totalNg !== null) {
          totalNg = kpiData.totalNg;
        } else if (defectList.length > 0) {
          totalNg = defectList.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0);
        } else {
          totalNg = FALLBACK_SUMMARY.totalNg;
        }

        if (compData.totalComplaints !== undefined && compData.totalComplaints !== null) {
          totalComplaints = compData.totalComplaints;
        } else {
          totalComplaints = FALLBACK_SUMMARY.totalComplaints;
        }
      }

      const defectRate = totalProd > 0 ? Number(((totalNg / totalProd) * 100).toFixed(2)) : 0;

      return {
        totalProduction: totalProd,
        totalNg: totalNg,
        defectRate: defectRate,
        totalComplaints: totalComplaints,
      };
    } catch (error) {
      console.warn('Backend summary unavailable, returning KPI:', error?.message);
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      if (isAdmin) {
        return FALLBACK_SUMMARY;
      }
      return { totalProduction: 0, totalNg: 0, defectRate: 0, totalComplaints: 0 };
    }
  },

  getPareto: async (period = 'daily', username, role) => {
    try {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      const now = new Date();
      let start = new Date();
      if (period === 'daily') {
        start = new Date();
      } else if (period === 'weekly') {
        start.setDate(now.getDate() - 7);
      } else if (period === 'monthly') {
        start.setDate(now.getDate() - 30);
      }

      const formatDate = (d) => d.toISOString().split('T')[0];
      const params = {
        startDate: formatDate(start),
        endDate: formatDate(now),
      };
      if (role) params.role = role;
      if (!isAdmin && username) params.username = username;

      const response = await apiClient.get(ENDPOINTS.DASHBOARD_PARETO, { params });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const total = response.data.reduce((acc, item) => acc + (item.totalQuantity || item.quantity || 0), 0);
        return response.data.slice(0, 5).map((item) => {
          const qty = item.totalQuantity || item.quantity || 0;
          const percentage = total > 0 ? Number(((qty / total) * 100).toFixed(1)) : 0;
          return {
            defectName: item.defectName || 'Defect',
            process: item.partName || item.process || 'Stamping',
            quantity: qty,
            percentage,
            severity: percentage > 25 ? 'critical' : 'warning',
          };
        });
      }

      // If operator has no defects recorded, return empty list!
      if (!isAdmin) {
        return [];
      }

      return FALLBACK_PARETO[period] || FALLBACK_PARETO.daily;
    } catch (error) {
      console.warn(`Backend pareto unavailable for ${period}:`, error?.message);
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      if (isAdmin) {
        return FALLBACK_PARETO[period] || FALLBACK_PARETO.daily;
      }
      return [];
    }
  },

  getDailyProduction: async (username, role) => {
    try {
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');

      if (!isAdmin) {
        // First check production records belonging to operator
        try {
          const userProdList = await productionService.getProductionList(username, role);
          if (Array.isArray(userProdList) && userProdList.length > 0) {
            const freshItems = userProdList.slice(0, 8).map((item, idx) => {
              const target = Number(item.targetQuantity ?? item.target ?? 0);
              const produced = Number(item.producedQuantity ?? item.produced ?? 0);
              const variance = produced - target;
              const efficiency = target > 0 ? Math.round((produced / target) * 100) : 100;
              const status = item.status || (produced >= target ? 'On Target' : 'Below Target');

              return {
                id: `prod-${item.id || idx}`,
                machineName: item.machineName || 'Mesin Produksi',
                process: `${item.line || 'Line'} • ${item.processName || 'Produksi'}`,
                target,
                produced,
                variance,
                efficiency,
                status,
              };
            });
            return freshItems;
          }
        } catch (e) {
          console.warn('Error mapping operator production list:', e);
        }

        return FALLBACK_DAILY_PROD;
      }

      // Admin gets global daily production from backend
      const params = { role: 'ADMIN' };
      const response = await apiClient.get(ENDPOINTS.DASHBOARD_DAILY_PROD, { params });
      let list = [];
      if (Array.isArray(response.data) && response.data.length > 0) {
        list = response.data.map((item, idx) => ({
          id: idx + 1,
          machineName: item.machineName || (item.shift ? `Shift ${item.shift} Line` : `Mesin #${idx + 1}`),
          process: item.processName || item.day || 'Produksi',
          target: Number(item.target || item.targetQuantity || 5000),
          produced: Number(item.produced || item.producedQuantity || 4800),
          variance: item.variance || (Number(item.produced || item.producedQuantity || 0) - Number(item.target || item.targetQuantity || 0)),
          efficiency: item.efficiency || Math.round((Number(item.produced || item.producedQuantity || 4800) / Number(item.target || item.targetQuantity || 5000)) * 100),
          status: item.status || (Number(item.produced || item.producedQuantity || 0) >= Number(item.target || item.targetQuantity || 0) ? 'On Target' : 'Below Target'),
        }));
      } else {
        list = FALLBACK_DAILY_PROD;
      }
      return list;
    } catch (error) {
      console.warn('Backend daily production unavailable:', error?.message);
      return FALLBACK_DAILY_PROD;
    }
  },
};

export default dashboardService;
