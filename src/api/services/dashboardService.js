import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import productionService from './productionService';
import defectService from './defectService';
import { getLocalDateString, normalizeDateString } from '../../utils/dateFormatter';
import { calculatePChart } from '../../utils/spcCalculator';
import {
  syncProductionWithDefects,
  isDefectEligibleForProduction,
} from '../../utils/productionDefectMatcher';

// Fallback Summary & Empty Datasets for Offline / Zero-Data State
const FALLBACK_SUMMARY = {
  totalProduction: 0,
  totalNg: 0,
  defectRate: 0,
  totalComplaints: 0,
};

const FALLBACK_PARETO = {
  daily: [],
  weekly: [],
  monthly: [],
};

const FALLBACK_DAILY_PROD = [];

/**
 * Resolves Date Range for Dashboard filtering:
 * - 'today' / 'daily': Hari Ini (1 hari kerja / hari ini)
 * - 'yesterday': Kemarin (H-1)
 * - 'weekly': 7 hari terakhir (H-6 s/d Hari ini)
 * - 'monthly': Bulan Ini (Tanggal 1 s/d Hari ini)
 * - 'custom': Date to Date (customStart s/d customEnd)
 */
export const resolveDateRange = (period = 'today', customStart = null, customEnd = null) => {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  if (period === 'today' || period === 'daily') {
    return { startDate: todayStr, endDate: todayStr, label: 'Hari Ini', daysCount: 1, todayStr };
  } else if (period === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const yestStr = getLocalDateString(yest);
    return { startDate: yestStr, endDate: yestStr, label: 'Kemarin', daysCount: 1, todayStr };
  } else if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { startDate: getLocalDateString(start), endDate: todayStr, label: '7 Hari Terakhir', daysCount: 7, todayStr };
  } else if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayDiff = Math.max(1, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return { startDate: getLocalDateString(start), endDate: todayStr, label: 'Bulan Ini', daysCount: dayDiff, todayStr };
  } else if (period === 'custom') {
    const validStart = customStart || todayStr;
    const validEnd = customEnd || todayStr;
    let dayDiff = 1;
    try {
      const sParts = validStart.split('-').map(Number);
      const eParts = validEnd.split('-').map(Number);
      const sDate = new Date(sParts[0], sParts[1] - 1, sParts[2]);
      const eDate = new Date(eParts[0], eParts[1] - 1, eParts[2]);
      dayDiff = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    } catch (e) {
      dayDiff = 30;
    }
    return { startDate: validStart, endDate: validEnd, label: `${validStart} s/d ${validEnd}`, daysCount: dayDiff, todayStr };
  } else {
    // Default fallback to today
    return { startDate: todayStr, endDate: todayStr, label: 'Hari Ini', daysCount: 1, todayStr };
  }
};

export const dashboardService = {
  getSummary: async (startDate, endDate, username, role, period = 'daily', customStart = null, customEnd = null) => {
    try {
      const cleanRole = role ? String(role).toUpperCase().trim() : '';
      const isAdmin = cleanRole.includes('ADMIN') || (username && String(username).toLowerCase().trim() === 'admin');
      const isStaffQc = cleanRole.includes('QC');
      const shouldGetAll = isAdmin || isStaffQc;

      // Hitung rentang tanggal terpadu (Daily, Weekly, Date to Date)
      const range = resolveDateRange(period, customStart || startDate, customEnd || endDate);
      const effectiveStart = range.startDate;
      const effectiveEnd = range.endDate;

      const params = {};
      if (effectiveStart) params.startDate = effectiveStart;
      if (effectiveEnd) params.endDate = effectiveEnd;
      if (role) params.role = role;
      if (shouldGetAll) {
        params.all = 'true';
      } else if (username) {
        params.username = username;
      }

      const [kpiRes, complaintsRes, userProdList, userDefectList] = await Promise.allSettled([
        apiClient.get(ENDPOINTS.DASHBOARD_SUMMARY, { params }),
        apiClient.get(ENDPOINTS.DASHBOARD_COMPLAINTS_SUMMARY, { params }),
        productionService.getProductionList(username, role, { all: shouldGetAll }),
        defectService.getShopFloorDefects(),
      ]);

      const compData = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data : {};
      const rawProdList = userProdList.status === 'fulfilled' && Array.isArray(userProdList.value) ? userProdList.value : [];
      const rawDefectList = userDefectList.status === 'fulfilled' && Array.isArray(userDefectList.value) ? userDefectList.value : [];

      // Filter daftar lokal persis sesuai rentang tanggal periode yang aktif (Daily, Weekly, Date to Date)
      const isWithinRange = (dateVal) => {
        if (!dateVal && dateVal !== 0) return false;
        const dStr = normalizeDateString(dateVal);
        if (!dStr) return false;
        return dStr >= effectiveStart && dStr <= effectiveEnd;
      };

      const prodList = rawProdList.filter((p) => isWithinRange(p.productionDate));
      const defectList = rawDefectList.filter((d) => isWithinRange(d.defectDate));

      // Calculate sum from actual period-filtered production list
      const sumProdList = prodList.reduce(
        (acc, p) => acc + (Number(p.producedQuantity ?? p.produced ?? p.grossProduced ?? 0)),
        0
      );

      // Calculate sum of NG attached to the production runs
      const sumProdNg = prodList.reduce(
        (acc, p) => acc + (Number(p.totalNg ?? 0)),
        0
      );

      // Calculate sum from shop floor defect list
      const sumDefectList = defectList.reduce(
        (acc, d) => acc + (Number(d.quantity ?? 0)),
        0
      );

      // Sinkronisasi KPI murni sesuai rentang waktu aktif (Daily, Weekly, Date to Date)
      let totalProd = sumProdList;
      let totalNg = Math.max(sumProdNg, sumDefectList);
      let totalComplaints = 0;

      // 3. Total Kasus Komplain
      if (Number(compData.totalComplaints) > 0) {
        totalComplaints = Number(compData.totalComplaints);
      } else if (compData.totalComplaints !== undefined && compData.totalComplaints !== null && !isAdmin) {
        totalComplaints = Number(compData.totalComplaints);
      } else {
        totalComplaints = 0;
      }

      // 4. Defect Rate
      const defectRate = totalProd > 0 ? Number(((totalNg / totalProd) * 100).toFixed(2)) : 0;

      return {
        totalProduction: totalProd,
        totalNg: totalNg,
        defectRate: defectRate,
        totalComplaints: totalComplaints,
        periodLabel: range.label,
      };
    } catch (error) {
      console.warn('Backend summary unavailable, calculating from local list:', error?.message);
      const isAdmin = (role && role.toUpperCase() === 'ADMIN') || (username && username.toLowerCase() === 'admin');
      try {
        const prodList = isAdmin ? await productionService.getProductionList() : await productionService.getProductionList(username, role);
        const defectList = isAdmin ? await defectService.getHistory('all') : await defectService.getHistory('all', username, role);
        const sumProd = Array.isArray(prodList) ? prodList.reduce((acc, p) => acc + (Number(p.producedQuantity ?? p.produced ?? p.grossProduced ?? 0)), 0) : 0;
        const sumNg = Array.isArray(defectList) ? defectList.reduce((acc, d) => acc + (Number(d.quantity ?? 0)), 0) : 0;

        if (sumProd > 0) {
          const rate = Number(((sumNg / sumProd) * 100).toFixed(2));
          return {
            totalProduction: sumProd,
            totalNg: sumNg,
            defectRate: rate,
            totalComplaints: 0,
          };
        }
      } catch (e) {
        console.warn('Local buffer fallback in catch failed:', e);
      }

      if (isAdmin) {
        return FALLBACK_SUMMARY;
      }
      return { totalProduction: 0, totalNg: 0, defectRate: 0, totalComplaints: 0 };
    }
  },

  /**
   * Statistical Process Control (SPC p-Chart)
   * Computes UCL, Center Line (CL), LCL, and process status from real production and defect data.
   * Basis utama pembentukan titik subgroup adalah Data Produksi (wajib produced > 0).
   * Temuan cacat (NG) Staff QC dihubungkan ke data produksi via 4 Kunci Konteks Operasional:
   * 1. Tanggal Kerja (production_date == defect_date)
   * 2. Waktu Kerja / Shift (shift == shift)
   * 3. Lini / Mesin (machine_name == nama_mesin)
   * 4. Komponen / Part (part_id / partNumber)
   * Rentang waktu tersinkronisasi dinamis berdasarkan:
   * - 'daily': Hari Ini (1 hari kerja)
   * - 'weekly': 7 hari terakhir (H-6 s/d Hari Ini)
   * - 'custom': Date to Date (customStart s/d customEnd)
   * - selectedDefect: 'ALL' (gabungan) atau nama spesifik jenis cacat (Stratified p-Chart)
   */
  getSpcData: async (
    period = 'daily',
    username,
    role,
    customStart = null,
    customEnd = null,
    selectedDefect = 'ALL'
  ) => {
    try {
      const cleanRole = role ? String(role).toUpperCase().trim() : '';
      const isAdmin = cleanRole.includes('ADMIN') || (username && String(username).toLowerCase().trim() === 'admin');
      const isStaffQc = cleanRole.includes('QC');

      // 1. Rentang Waktu SPC Berdasarkan Periode Terpadu (Daily, Weekly, Date to Date)
      const range = resolveDateRange(period, customStart, customEnd);
      const minDateStr = range.startDate;
      const maxDateStr = range.endDate;
      const todayStr = range.todayStr || getLocalDateString(new Date());
      const daysCount = range.daysCount || 7;
      const periodLabel = range.label || '7 Hari Terakhir';

      // SPC Control Chart memantau stabilitas proses seluruh lini/mesin pabrik
      const [userProdList, userDefectList] = await Promise.all([
        productionService.getProductionList(username, role, { all: true }),
        defectService.getShopFloorDefects(),
      ]);

      const rawProdList = Array.isArray(userProdList) ? userProdList : [];
      const rawDefectList = Array.isArray(userDefectList) ? userDefectList : [];

      const isWithinPeriod = (dateVal) => {
        if (!dateVal && dateVal !== 0) return false;
        const dStr = normalizeDateString(dateVal);
        if (!dStr) return false;
        return dStr >= minDateStr && dStr <= maxDateStr;
      };

      // Filter ketat: Hanya ambil data produksi dalam rentang periode aktif yang memiliki hasil produksi valid (> 0 pcs)
      // JANGAN PERNAH menyertakan data dengan produksi 0 pcs
      const prodList = rawProdList.filter((p) => {
        const produced = Number(p.producedQuantity ?? p.produced ?? p.grossProduced ?? 0);
        return isWithinPeriod(p.productionDate) && produced > 0;
      });

      // Filter cacat dalam rentang periode aktif
      const defectList = rawDefectList.filter((d) => isWithinPeriod(d.defectDate));

      // Hitung frekuensi akumulasi seluruh jenis cacat pada periode aktif untuk stratifikasi SPC (Top 5 Cacat Utama)
      const defectCounts = {};
      defectList.forEach((d) => {
        const name = (d.defectName || 'Lain-lain').trim();
        const qty = Number(d.quantity || 0);
        defectCounts[name] = (defectCounts[name] || 0) + qty;
      });

      const totalDefectQty = Object.values(defectCounts).reduce((acc, q) => acc + q, 0);

      const topDefects = Object.entries(defectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], idx) => ({
          id: `defect-${idx + 1}`,
          name,
          count,
          percentage: totalDefectQty > 0 ? Number(((count / totalDefectQty) * 100).toFixed(1)) : 0,
        }));

      // 2. Filter Subgroup Valid (Wajib Ada Produksi > 0)
      // Jika tidak ada laporan produksi valid dalam periode aktif, kembalikan Empty State
      if (prodList.length === 0) {
        return {
          ...calculatePChart([]),
          period,
          periodLabel: range.label,
          daysCount,
          topDefects,
          selectedDefect,
        };
      }

      // Hubungkan temuan cacat ke batch produksi via 4 Kunci Konteks Operasional
      const syncedProdList = syncProductionWithDefects(prodList, defectList);

      const isStratified = Boolean(selectedDefect && selectedDefect !== 'ALL');
      const targetDefectLower = isStratified ? selectedDefect.trim().toLowerCase() : '';

      // Kelompokkan data produksi per Mesin agar data teragregasi bersih & tidak menduplikasi 59 baris
      const machineSubgroupMap = new Map();

      syncedProdList.forEach((p) => {
        const mName = p.machineName || 'Mesin';
        const produced = Number(p.producedQuantity ?? p.produced ?? p.grossProduced ?? 0);
        if (produced <= 0) return;

        if (!machineSubgroupMap.has(mName)) {
          machineSubgroupMap.set(mName, {
            machineName: mName,
            process: p.processName || p.process || 'Stamping',
            produced: 0,
            ng: 0,
            defects: [],
            productionDate: p.productionDate,
          });
        }

        const mData = machineSubgroupMap.get(mName);
        mData.produced += produced;

        const matchingDefects = p.defects || [];
        mData.defects.push(...matchingDefects);

        if (isStratified) {
          // Hanya hitung cacat sesuai jenis cacat yang dipilih pada chip filter
          const matchedSpecific = matchingDefects.filter(
            (d) => (d.defectName || '').trim().toLowerCase() === targetDefectLower
          );
          const specificNg = matchedSpecific.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
          mData.ng += specificNg;
        } else {
          // Hitung semua cacat
          mData.ng += Number(p.totalNg ?? 0);
        }
      });

      // Filter mesin yang terkena defect:
      // Jika jenis defect tertentu dipilih, HANYA masukkan mesin yang mengalami defect tersebut (ng > 0)!
      // Ini menyelesaikan masalah penumpukan 59 nama mesin di grafik.
      let filteredMachineList = [];

      if (isStratified) {
        filteredMachineList = Array.from(machineSubgroupMap.values())
          .filter((m) => m.ng > 0)
          .sort((a, b) => b.ng - a.ng);
      } else {
        // Jika 'ALL' (Semua Cacat):
        // Prioritaskan mesin yang memiliki temuan cacat (ng > 0)
        const withDefects = Array.from(machineSubgroupMap.values())
          .filter((m) => m.ng > 0)
          .sort((a, b) => b.ng - a.ng);

        if (withDefects.length > 0) {
          filteredMachineList = withDefects.slice(0, 8); // Maksimal 8 mesin teratas dengan cacat
        } else {
          // Jika tidak ada cacat sama sekali, ambil maksimal 5 mesin aktif
          filteredMachineList = Array.from(machineSubgroupMap.values()).slice(0, 5);
        }
      }

      // Bangun subgroup titik p-Chart khusus untuk mesin yang terdampak
      const validSubgroups = filteredMachineList.map((m, idx) => {
        // Bersihkan nama mesin untuk label sumbu X agar ringkas dan tidak bertumpuk
        let cleanName = String(m.machineName || '')
          .replace(/\b(Mesin|Machine|Lini|Line)\b/gi, '')
          .replace(/\b(Stamping|Press|Robot|Welding|Bending)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        cleanName = cleanName.replace(/\((\d+)\)/g, '$1').replace(/\s+/g, ' ').trim();
        const shortLabel = cleanName || `M-${idx + 1}`;

        return {
          id: `subgroup-${m.machineName}-${idx + 1}`,
          date: normalizeDateString(m.productionDate) || todayStr,
          label: shortLabel,
          produced: m.produced,
          ng: m.ng,
          machineName: m.machineName,
          process: m.process,
          topDefect: isStratified ? selectedDefect : (m.defects[0]?.defectName || 'Gompal'),
        };
      });

      if (validSubgroups.length === 0) {
        return {
          ...calculatePChart([]),
          period,
          periodLabel,
          daysCount,
          topDefects,
          selectedDefect,
        };
      }

      const calculated = calculatePChart(validSubgroups);
      return {
        ...calculated,
        period,
        periodLabel,
        daysCount,
        topDefects,
        selectedDefect,
      };
    } catch (err) {
      console.warn('getSpcData error, returning fallback:', err);
      return {
        ...calculatePChart([]),
        period,
        topDefects: [],
        selectedDefect,
      };
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

      const formatDate = (d) => getLocalDateString(d);
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

  getDailyProduction: async (username, role, period = 'daily', customStart = null, customEnd = null, selectedDefect = 'ALL') => {
    try {
      const cleanRole = role ? String(role).toUpperCase().trim() : '';
      const isAdmin = cleanRole.includes('ADMIN') || (username && String(username).toLowerCase().trim() === 'admin');
      const isStaffQc = cleanRole.includes('QC');
      const shouldGetAll = isAdmin || isStaffQc;

      // Rentang waktu tersinkronisasi dinamis: Daily, Weekly, Date to Date
      const range = resolveDateRange(period, customStart, customEnd);
      const minDateStr = range.startDate;
      const maxDateStr = range.endDate;
      const todayStr = range.todayStr || getLocalDateString(new Date());
      const daysCount = range.daysCount || 7;

      const isWithinPeriod = (dateVal) => {
        if (!dateVal && dateVal !== 0) return false;
        const dStr = normalizeDateString(dateVal);
        if (!dStr) return false;
        return dStr >= minDateStr && dStr <= maxDateStr;
      };

      // Fetch defects to calculate net good parts (Good Parts Only ISO 9001:2015)
      let allDefects = [];
      try {
        allDefects = await defectService.getShopFloorDefects();
      } catch (e) {
        console.warn('Failed to load defect history for daily production matching:', e?.message);
      }

      const filteredDefects = allDefects.filter((d) => isWithinPeriod(d.defectDate));

      let baseList = [];
      try {
        const prodList = await productionService.getProductionList(username, role, { all: shouldGetAll });
        if (Array.isArray(prodList) && prodList.length > 0) {
          baseList = prodList;
        } else if (isAdmin) {
          const params = {
            role: 'ADMIN',
            startDate: minDateStr,
            endDate: todayStr,
          };
          const response = await apiClient.get(ENDPOINTS.DASHBOARD_DAILY_PROD, { params });
          if (Array.isArray(response.data) && response.data.length > 0) {
            baseList = response.data;
          } else {
            baseList = FALLBACK_DAILY_PROD;
          }
        }
      } catch (e) {
        console.warn('Error fetching production list for daily aggregation:', e);
      }

      // Filter data produksi dalam periode aktif
      const periodProdList = baseList.filter((p) => isWithinPeriod(p.productionDate));

      // Hubungkan data produksi dengan temuan cacat Staff QC via 4 Kunci Konteks Operasional
      const syncedList = syncProductionWithDefects(periodProdList, filteredDefects);

      const isStratified = Boolean(selectedDefect && selectedDefect !== 'ALL');
      const targetDefectLower = isStratified ? selectedDefect.trim().toLowerCase() : '';

      // Agregasi total produksi dan total cacat per Mesin sesuai rentang periode yang aktif
      const machineMap = new Map();

      syncedList.forEach((item) => {
        const mName = item.machineName || 'Mesin';
        if (!machineMap.has(mName)) {
          machineMap.set(mName, {
            id: item.id || `machine-${mName}`,
            machineName: mName,
            process: item.process || `${item.line || 'Line'} • ${item.processName || 'Produksi'}`,
            target: 0,
            grossProduced: 0,
            produced: 0,
            totalNg: 0,
            batchCount: 0,
            defects: [],
          });
        }

        const mData = machineMap.get(mName);
        const itemTarget = Number(item.targetQuantity ?? item.target ?? 0);
        const itemProduced = Number(item.producedQuantity ?? item.grossProduced ?? item.produced ?? 0);

        mData.target += itemTarget;
        mData.grossProduced += itemProduced;
        mData.produced += itemProduced;
        mData.batchCount += 1;

        const matchingDefects = item.defects || [];
        mData.defects.push(...matchingDefects);

        if (isStratified) {
          // Hanya hitung temuan cacat khusus untuk jenis defect yang dipilih!
          const matchedSpecific = matchingDefects.filter(
            (d) => (d.defectName || '').trim().toLowerCase() === targetDefectLower
          );
          const specificNg = matchedSpecific.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
          mData.totalNg += specificNg;
        } else {
          mData.totalNg += Number(item.totalNg ?? 0);
        }
      });

      // Filter daftar mesin:
      let filteredMachines = Array.from(machineMap.values());

      if (isStratified) {
        // HANYA munculkan mesin yang terkena jenis defect yang dipilih (totalNg > 0)!
        filteredMachines = filteredMachines
          .filter((m) => m.totalNg > 0)
          .sort((a, b) => b.totalNg - a.totalNg);
      } else {
        // Jika 'ALL': Tampilkan mesin yang memiliki temuan cacat terlebih dahulu
        const withDefects = filteredMachines
          .filter((m) => m.totalNg > 0)
          .sort((a, b) => b.totalNg - a.totalNg);

        if (withDefects.length > 0) {
          filteredMachines = withDefects;
        } else {
          filteredMachines = filteredMachines.slice(0, 8);
        }
      }

      // Hitung metrik agregasi final untuk tiap mesin (Defect Rate, Net Produced, Variance, Status)
      const aggregatedList = filteredMachines.map((m) => {
        const netProduced = Math.max(0, m.grossProduced - m.totalNg);
        const variance = netProduced - m.target;
        const efficiency = m.target > 0 ? Number(((netProduced / m.target) * 100).toFixed(1)) : 100;
        const status = netProduced >= m.target ? 'On Target' : 'Below Target';
        const defectRate = m.grossProduced > 0 ? Number(((m.totalNg / m.grossProduced) * 100).toFixed(1)) : 0;

        return {
          ...m,
          netProduced,
          variance,
          efficiency,
          status,
          defectRate,
          selectedDefect,
        };
      });

      return aggregatedList;
    } catch (error) {
      console.warn('getDailyProduction error, returning empty list:', error?.message);
      return [];
    }
  },
};

export default dashboardService;
